import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sendMessageStream, fetchConversationHistory } from '@/api/chat'
import { STORAGE_KEYS, getItem, setItem, debouncedSetItem } from '@/utils/storage'

// 生成 UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export const useChatStore = defineStore('chat', () => {
  // ========== 状态 ==========
  const conversations = ref([]) // 所有会话列表
  const currentConversationId = ref(null) // 当前激活的会话 ID
  const isStreaming = ref(false) // 是否正在流式输出
  const currentStreamingMessage = ref(null) // 当前正在流式输出的消息

  let abortController = null // 用于取消请求

  // ========== 计算属性 ==========
  const currentConversation = computed(() => {
    return conversations.value.find((c) => c.id === currentConversationId.value)
  })

  const currentMessages = computed(() => {
    return currentConversation.value?.messages || []
  })

  // ========== 会话管理 ==========
  /**
   * 创建新会话
   */
  function createConversation(title = '新对话') {
    const conversation = {
      id: generateUUID(), // 使用 UUID 作为 conversation_id
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    }
    console.log('Creating conversation:', conversation)
    conversations.value.unshift(conversation)
    currentConversationId.value = conversation.id
    autoSave()
    return conversation
  }

  /**
   * 切换会话
   */
  function switchConversation(conversationId) {
    const conv = conversations.value.find((c) => c.id === conversationId)
    if (conv) {
      currentConversationId.value = conversationId
    }
  }

  /**
   * 删除会话
   */
  function deleteConversation(conversationId) {
    const index = conversations.value.findIndex((c) => c.id === conversationId)
    if (index > -1) {
      conversations.value.splice(index, 1)
      if (currentConversationId.value === conversationId) {
        if (conversations.value.length > 0) {
          switchConversation(conversations.value[0].id)
        } else {
          createConversation()
        }
      }
      autoSave()
    }
  }

  /**
   * 更新会话标题
   */
  function updateConversationTitle(conversationId, title) {
    const conv = conversations.value.find((c) => c.id === conversationId)
    if (conv) {
      conv.title = title
      conv.updatedAt = new Date().toISOString()
      autoSave()
    }
  }

  // ========== 消息管理 ==========
  /**
   * 添加消息
   */
  function addMessage(role, content, metadata = {}) {
    if (!currentConversation.value) return null

    const message = {
      id: Date.now().toString() + Math.random(),
      role, // 'user' | 'assistant' | 'system'
      content,
      timestamp: new Date().toISOString(),
      streaming: false,
      toolCalls: [],
      ...metadata
    }

    currentConversation.value.messages.push(message)
    currentConversation.value.updatedAt = new Date().toISOString()

    // 自动更新会话标题（使用第一条用户消息）
    if (currentConversation.value.messages.length === 1 && role === 'user') {
      currentConversation.value.title = content.slice(0, 30) + (content.length > 30 ? '...' : '')
    }

    autoSave()
    return message
  }

  /**
   * 更新消息内容（用于流式输出）
   */
  function updateMessage(messageId, content) {
    if (!currentConversation.value) return

    const message = currentConversation.value.messages.find((m) => m.id === messageId)
    if (message) {
      message.content = content
      message.timestamp = new Date().toISOString()
    }
  }

  /**
   * 更新消息的工具调用列表
   */
  function updateToolCalls(messageId, toolCalls) {
    if (!currentConversation.value) return

    const message = currentConversation.value.messages.find((m) => m.id === messageId)
    if (message) {
      message.toolCalls = Array.isArray(toolCalls) ? [...toolCalls] : []
      message.timestamp = new Date().toISOString()
    }
  }

  /**
   * 标记消息流式状态结束
   */
  function finishStreaming(messageId) {
    if (!currentConversation.value) return

    const message = currentConversation.value.messages.find((m) => m.id === messageId)
    if (message) {
      message.streaming = false
    }
    isStreaming.value = false
    currentStreamingMessage.value = null
    autoSave()
  }

  // ========== 发送消息 ==========
  /**
   * 发送消息并接收流式响应
   * @param {string} userMessage - 用户消息文本
   * @param {object|null} imageData - 图片数据 { base64, format, dataUrl }
   */
  async function sendMessage(userMessage, imageData = null) {
    if (!currentConversation.value) {
      createConversation()
    }

    // 添加用户消息（如果有图片，可以在消息中附加图片信息）
    const userMsgMeta = imageData ? { hasImage: true, imagePreview: imageData.dataUrl } : {}
    addMessage('user', userMessage, userMsgMeta)

    // 创建助手消息占位
    const assistantMessage = addMessage('assistant', '', { streaming: true })
    isStreaming.value = true
    currentStreamingMessage.value = assistantMessage

    try {
      abortController = new AbortController()

      // 将 base64 转换为 Blob/File 对象用于 FormData
      let imageFile = null
      if (imageData && imageData.base64) {
        const byteCharacters = atob(imageData.base64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const mimeType = `image/${imageData.format || 'jpeg'}`
        imageFile = new Blob([byteArray], { type: mimeType })
      }

      await sendMessageStream(userMessage, imageFile, currentConversation.value.id, {
        signal: abortController.signal,
        onChunk: (text, accumulated) => {
          updateMessage(assistantMessage.id, accumulated)
        },
        onToolCall: (toolNames) => {
          updateToolCalls(assistantMessage.id, toolNames)
        },
        onToolResult: (result, accumulated) => {
          updateMessage(assistantMessage.id, accumulated)
          updateToolCalls(assistantMessage.id, [])
        }
      })

      finishStreaming(assistantMessage.id)
    } catch (error) {
      console.error('发送消息失败:', error)

      if (error.name === 'AbortError') {
        finishStreaming(assistantMessage.id)
      } else {
        updateMessage(assistantMessage.id, '抱歉，发送消息时出现错误。请稍后重试。')
        finishStreaming(assistantMessage.id)
        throw error
      }
    } finally {
      abortController = null
    }
  }

  /**
   * 停止当前流式输出
   */
  function stopStreaming() {
    if (abortController) {
      try {
        abortController.abort()
      } catch (e) {
        console.error('取消请求失败:', e)
      }
    }

    if (currentStreamingMessage.value) {
      updateToolCalls(currentStreamingMessage.value.id, [])
      finishStreaming(currentStreamingMessage.value.id)
    }
  }

  // ========== 本地存储 ==========

  /**
   * 从 localStorage 加载会话
   */
  function loadConversations() {
    try {
      const saved = getItem(STORAGE_KEYS.CHAT_CONVERSATIONS)
      if (saved && Array.isArray(saved)) {
        conversations.value = saved

        if (conversations.value.length > 0) {
          currentConversationId.value = conversations.value[0].id
        } else {
          createConversation()
        }
      } else {
        createConversation()
      }
    } catch (error) {
      console.error('加载会话失败:', error)
      createConversation()
    }
  }

  /**
   * 保存会话到 localStorage
   */
  function saveConversations() {
    setItem(STORAGE_KEYS.CHAT_CONVERSATIONS, conversations.value)
  }

  /**
   * 自动保存（防抖）
   */
  function autoSave() {
    debouncedSetItem(STORAGE_KEYS.CHAT_CONVERSATIONS, conversations.value, 1000)
  }

  /**
   * 清空所有会话
   */
  function clearAllConversations() {
    conversations.value = []
    createConversation()
    saveConversations()
  }

  /**
   * 从服务器加载指定会话的历史消息
   * @param {string} conversationId - 会话ID
   */
  async function loadConversationHistory(conversationId) {
    try {
      const { messages } = await fetchConversationHistory(conversationId)
      
      const conv = conversations.value.find((c) => c.id === conversationId)
      if (conv && Array.isArray(messages)) {
        // 将服务器返回的消息格式转换为本地格式
        conv.messages = messages.map((msg, index) => ({
          id: `${conversationId}-${index}-${Date.now()}`,
          role: msg.role,
          content: msg.content,
          timestamp: new Date().toISOString(),
          streaming: false,
          toolCalls: []
        }))
        conv.updatedAt = new Date().toISOString()
        
        // 更新会话标题（使用第一条用户消息）
        const firstUserMsg = conv.messages.find(m => m.role === 'user')
        if (firstUserMsg) {
          conv.title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')
        }
        
        autoSave()
      }
      return messages
    } catch (error) {
      console.error('加载历史消息失败:', error)
      throw error
    }
  }

  return {
    // 状态
    conversations,
    currentConversationId,
    currentConversation,
    currentMessages,
    isStreaming,
    currentStreamingMessage,

    // 会话管理
    createConversation,
    switchConversation,
    deleteConversation,
    updateConversationTitle,

    // 消息管理
    addMessage,
    updateMessage,
    updateToolCalls,

    // 发送消息
    sendMessage,
    stopStreaming,

    // 本地存储
    loadConversations,
    saveConversations,
    clearAllConversations,
    loadConversationHistory
  }
})
