import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  sendMessageStream,
  fetchConversationHistory,
  fetchConversationList,
  deleteConversation as deleteConversationApi
} from '@/api/chat'
import { STORAGE_KEYS, getItem, setItem, debouncedSetItem } from '@/utils/storage'

// 生成 UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
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
      messages: [],
      isCloudSync: false // 本地创建的会话
    }
    conversations.value.unshift(conversation)
    currentConversationId.value = conversation.id
    autoSave()
    return conversation
  }

  /**
   * 切换会话
   * 如果是云端同步的会话且消息未加载，会自动加载消息内容
   */
  async function switchConversation(conversationId) {
    const conv = conversations.value.find((c) => c.id === conversationId)
    if (conv) {
      currentConversationId.value = conversationId

      // 如果是云端会话且需要加载消息
      if (conv.isCloudSync && conv.needsLoad) {
        try {
          await loadConversationHistory(conversationId)
          conv.needsLoad = false
          autoSave()
        } catch (error) {
          console.error('加载云端会话消息失败:', error)
        }
      }
    }
  }

  /**
   * 删除会话
   */
  function deleteConversation(conversationId) {
    const index = conversations.value.findIndex((c) => c.id === conversationId)
    if (index === -1) return

    // 先更新本地状态
    conversations.value.splice(index, 1)
    if (currentConversationId.value === conversationId) {
      if (conversations.value.length > 0) {
        switchConversation(conversations.value[0].id)
      } else {
        createConversation()
      }
    }
    autoSave()

    // 尝试通知后端删除对应会话
    // 这里采用“本地立即删除 + 后端失败仅打日志”的策略，避免影响前端交互
    deleteConversationApi(conversationId).catch((err) => {
      console.error('删除会话接口调用失败:', err)
    })
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
   * 从 localStorage 加载会话，并与云端列表合并
   * 策略：本地已有的会话保持不变，云端独有的会话作为占位添加（标记为云端同步）
   */
  async function loadConversations() {
    try {
      // 1. 先加载本地存储的会话
      const saved = getItem(STORAGE_KEYS.CHAT_CONVERSATIONS)
      if (saved && Array.isArray(saved)) {
        conversations.value = saved
      }

      // 2. 尝试从云端获取对话列表并合并
      try {
        await mergeCloudConversations()
      } catch (cloudError) {
        console.warn('获取云端对话列表失败，仅使用本地数据:', cloudError)
      }

      // 3. 设置当前会话
      if (conversations.value.length > 0) {
        currentConversationId.value = conversations.value[0].id
      } else {
        createConversation()
      }
    } catch (error) {
      console.error('加载会话失败:', error)
      createConversation()
    }
  }

  /**
   * 从云端获取对话列表并与本地合并
   * 本地已有的不覆盖，云端独有的添加为占位会话
   */
  async function mergeCloudConversations() {
    const cloudList = await fetchConversationList()

    if (!Array.isArray(cloudList) || cloudList.length === 0) {
      return
    }

    // 获取本地已有的会话 ID 集合
    const localIds = new Set(conversations.value.map((c) => c.id))

    // 筛选出云端独有的会话
    const cloudOnlyConversations = cloudList
      .filter((cloud) => !localIds.has(cloud.id))
      .map((cloud) => ({
        id: cloud.id,
        title: cloud.title || '未命名对话',
        // 云端返回的是时间戳（毫秒），转换为 ISO 字符串
        createdAt: cloud.created_at
          ? new Date(cloud.created_at).toISOString()
          : new Date().toISOString(),
        updatedAt: cloud.updated_at
          ? new Date(cloud.updated_at).toISOString()
          : new Date().toISOString(),
        messages: [], // 消息需要点击时再加载
        isCloudSync: true, // 标记为云端同步
        cloudSyncTime: null, // 实际内容加载后设置
        needsLoad: true // 标记需要加载消息内容
      }))

    if (cloudOnlyConversations.length > 0) {
      // 将云端独有的会话添加到列表末尾
      conversations.value.push(...cloudOnlyConversations)

      // 按更新时间排序（最新的在前）
      conversations.value.sort((a, b) => {
        const timeA = new Date(a.updatedAt).getTime()
        const timeB = new Date(b.updatedAt).getTime()
        return timeB - timeA
      })

      autoSave()
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
   * 从服务器加载指定会话的历史消息
   * @param {string} conversationId - 会话ID
   * @param {boolean} markAsCloudSync - 是否标记为云端同步的会话（默认 true）
   */
  async function loadConversationHistory(conversationId, markAsCloudSync = true) {
    try {
      const { messages } = await fetchConversationHistory(conversationId)

      const conv = conversations.value.find((c) => c.id === conversationId)
      if (conv && Array.isArray(messages)) {
        // 将服务器返回的消息格式转换为本地格式，过滤掉没有内容的消息
        conv.messages = messages
          .filter((msg) => msg.content !== undefined && msg.content !== null)
          .map((msg, index) => ({
            id: `${conversationId}-${index}-${Date.now()}`,
            role: msg.role || 'assistant',
            content: msg.content,
            timestamp: new Date().toISOString(),
            streaming: false,
            toolCalls: [],
            isCloudSync: markAsCloudSync // 标记消息来源
          }))
        conv.updatedAt = new Date().toISOString()

        // 标记会话为云端同步
        if (markAsCloudSync) {
          conv.isCloudSync = true
          conv.cloudSyncTime = new Date().toISOString()
        }

        // 更新会话标题（使用第一条用户消息）
        const firstUserMsg = conv.messages.find((m) => m.role === 'user')
        if (firstUserMsg && firstUserMsg.content) {
          conv.title =
            firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')
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
    loadConversationHistory,
    mergeCloudConversations
  }
})
