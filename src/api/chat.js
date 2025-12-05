import { apiBaseURL } from './axios-config'

// 获取认证头信息
function getAuthHeaders() {
  const headers = {}
  const token = localStorage.getItem('auth_token')
  const identifier = localStorage.getItem('auth_identifier')
  const cookie = localStorage.getItem('auth_cookie')
  
  if (token) {
    headers.Authorization = token
  }
  if (identifier) {
    headers.Id = identifier
  }
  if (cookie) {
    headers.Cookies = cookie
  }
  return headers
}

// 发送消息并接收流式响应
// message: 用户消息
// conversationId: 会话ID（必传）
// onChunk: 每次增量文本回调 (chunk, accumulated)
// onToolCall: 工具调用发生回调 (toolNames[])
// onToolResult: 工具返回结果回调 (resultStr, accumulated)
// signal: AbortSignal 用于取消
// 返回: Promise<string> 最终累计文本
export async function sendMessageStream(
  message, image, conversationId,
  { onChunk, onToolCall, onToolResult, signal } = {}
) {
  let accumulatedText = ''
  const formData = new FormData();
  formData.append('image', image);
  try {
    const response = await fetch(
      `${apiBaseURL}/api/v1/chat/sse?message=${encodeURIComponent(message)}&conversation_id=${encodeURIComponent(conversationId)}`,
      {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'text/event-stream',
          ...getAuthHeaders()
        },
        signal
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.trim().startsWith('data: ')) {
          const dataStr = line.trim().substring(6)
          try {
            const data = JSON.parse(dataStr)

            // 1) 普通文本增量
            if (data.text) {
              accumulatedText += data.text
              if (onChunk) {
                onChunk(data.text, accumulatedText)
              }
            }

            // 2) MCP 工具调用提示
            if (Array.isArray(data.tool_calls) && data.tool_calls.length > 0) {
              const toolNames = data.tool_calls
                .map((tc) => tc?.function?.name || tc?.custom?.name || tc?.type || '工具')
                .filter(Boolean)
              if (onToolCall) {
                onToolCall(toolNames)
              }
            }

            // 3) MCP 工具返回结果
            if (data.result) {
              const raw =
                typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2)
              const resultStr = decodeEscapedNewlines(raw)
              accumulatedText += resultStr
              if (onToolResult) {
                onToolResult(resultStr, accumulatedText)
              }
              if (onChunk) {
                onChunk(resultStr, accumulatedText)
              }
            }
          } catch (e) {
            console.warn('解析 JSON 失败:', dataStr, e)
          }
        }
      }
    }

    return accumulatedText
  } catch (error) {
    if (error.name === 'AbortError') {
      // 用户主动中断，返回已有内容
      return accumulatedText
    }
    throw error
  }
}

// 将形如 "\n" 的转义序列还原为实际换行/制表符
function decodeEscapedNewlines(str) {
  if (typeof str !== 'string') return str
  if (str.indexOf('\\') === -1) return str

  let s = str
  s = s.replace(/\\r\\n/g, '\r\n')
  s = s.replace(/\\n/g, '\n')
  s = s.replace(/\\r/g, '\r')
  s = s.replace(/\\t/g, '\t')
  return s
}

// ========== 主动助手相关接口预留 ==========
// 后端可以基于用户、课程进度等，返回希望在助手中展示的推荐项
// 例如待办提醒、课程通知、预习资料等
// 这里返回统一结构，方便前端渲染到 LiveAssistence / QuickActions
export async function fetchAssistantRecommendations(params = {}) {
  const query = new URLSearchParams(params).toString()
  const url = query
    ? `${apiBaseURL}/mcp/api/v1/assistant/recommendations?${query}`
    : `${apiBaseURL}/mcp/api/v1/assistant/recommendations`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch assistant recommendations: ${res.status}`)
  }

  const data = await res.json()

  // 期望后端返回形如：
  // [{ id, title, description, preset, type, extra }]
  // 若结构不同，可在此处做一次映射适配
  return Array.isArray(data) ? data : data?.items || []
}

// ========== 获取历史对话记录 ==========
// 根据 conversation_id 获取历史消息
export async function fetchConversationHistory(conversationId) {
  const res = await fetch(
    `${apiBaseURL}/api/v1/conversation/history?conversation_id=${encodeURIComponent(conversationId)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    }
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch conversation history: ${res.status}`)
  }

  const result = await res.json()

  if (result.code !== '10000') {
    throw new Error(result.message || 'Failed to fetch conversation history')
  }

  // 解析 messages 字符串为数组
  const data = result.data
  let messages = []
  if (data?.messages) {
    try {
      messages = typeof data.messages === 'string' ? JSON.parse(data.messages) : data.messages
    } catch (e) {
      console.warn('解析历史消息失败:', e)
    }
  }

  return {
    conversationId: data?.conversation_id,
    messages
  }
}

// ========== 删除会话 ==========
// 根据 conversation_id 删除后端会话记录
export async function deleteConversation(conversationId) {
  const res = await fetch(`${apiBaseURL}/api/v1/conversation/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ conversation_id: conversationId })
  })

  if (!res.ok) {
    throw new Error(`Failed to delete conversation: ${res.status}`)
  }

  const result = await res.json()
  if (result.code !== '10000') {
    throw new Error(result.message || 'Failed to delete conversation')
  }

  return result
}
