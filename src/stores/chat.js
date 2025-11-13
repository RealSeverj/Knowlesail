import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sendMessageStream } from '@/api/chat'

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
      id: Date.now().toString(),
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    }
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
   */
  async function sendMessage(userMessage) {
    if (!currentConversation.value) {
      createConversation()
    }

    // 添加用户消息
    addMessage('user', userMessage)

    // 创建助手消息占位
    const assistantMessage = addMessage('assistant', '', { streaming: true })
    isStreaming.value = true
    currentStreamingMessage.value = assistantMessage

    try {
      abortController = new AbortController()

      await sendMessageStream(userMessage, {
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
  const STORAGE_KEY = 'chat_conversations'

  /**
   * 从 localStorage 加载会话
   */
  function loadConversations() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        conversations.value = parsed

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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.value))
    } catch (error) {
      console.error('保存会话失败:', error)
    }
  }

  /**
   * 自动保存（防抖）
   */
  let saveTimer = null
  function autoSave() {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      saveConversations()
    }, 1000)
  }

  /**
   * 清空所有会话
   */
  function clearAllConversations() {
    conversations.value = []
    createConversation()
    saveConversations()
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
    clearAllConversations
  }
})
