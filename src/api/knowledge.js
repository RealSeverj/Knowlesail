import { http } from './axios-config'

/**
 * 搜索知识库内容
 * @param {string} keyword 搜索关键字
 * @returns {Promise<{ items: Array }>} 搜索结果
 */
export function searchKnowledge(keyword) {
  const trimmed = keyword.trim()

  // TODO: 接入后端搜索接口，当前仍使用 mock
  const mockResults = [
    {
      id: '4b4b0a0a-5ff6-445c-b7fe-4f09a7e1f4d1',
      type: 'summary',
      title: '问好范例',
      snippet: '用户与助手进行了初步的问候互动，助手主动提供帮助选项……',
      source: '我的笔记',
      highlight: trimmed
    }
  ]

  const filtered = mockResults.filter((item) =>
    trimmed ? item.title.includes(trimmed) || item.snippet.includes(trimmed) : true
  )

  return Promise.resolve({
    items: filtered
  })
}

/**
 * 获取对话总结（AI 总结）
 * POST /api/v1/conversation/summarize
 * @param {string} conversationId 对话 ID
 * @returns {Promise<Object>} { sum_id, summary, tags, tool_calls_json, notes }
 */
export async function summarizeConversation(conversationId) {
  const res = await http.post('/api/v1/conversation/summarize', {
    conversation_id: conversationId
  })
  return res.data
}

/**
 * 获取总结详情
 * GET /api/v1/summary/detail?id=xxx
 * @param {string} summaryId 总结 ID
 * @returns {Promise<Object>} summary 对象
 */
export async function getSummaryDetail(summaryId) {
  const res = await http.get('/api/v1/summary/detail', {
    params: { id: summaryId }
  })
  return res.data?.summary ?? res.data
}

/**
 * 获取总结列表
 * GET /api/v1/summary/list
 * @returns {Promise<Array>} summaries 数组
 */
export async function listSummaries() {
  const res = await http.get('/api/v1/summary/list')
  // 后端返回 { code, message, data: { summaries: [...] } }
  return res.data?.summaries ?? res.data?.data?.summaries ?? []
}

/**
 * 更新总结
 * PUT /api/v1/summary/update
 * @param {Object} data { id, summary_text, tags, tool_calls_json, notes }
 * @returns {Promise<Object>}
 */
export async function updateSummary(data) {
  const res = await http.put('/api/v1/summary/update', data)
  return res.data
}
