<script setup>
import { ref, computed, watch, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useKnowledgeStore } from '@/stores/knowledge'
import { summarizeConversation, listSummaries } from '@/api/knowledge'
import { useToast } from '@/composables/useToast'
import ChatSelection from './ChatSelection.vue'

const router = useRouter()
const chatStore = useChatStore()
const knowledgeStore = useKnowledgeStore()
const toast = useToast()

// 状态：idle | exists | loading | select | ready
const exportState = ref('idle')
const loading = ref(false)
const summaryResult = ref(null)

// 已存在的 summary ID（用于跳转详情页）
const existingSummaryId = ref(null)

// 聊天选择器显示状态
const showChatSelection = ref(false)

// 已选择的聊天块 IDs
const selectedMessageIds = ref([])

// 按钮文字
const buttonText = computed(() => {
  switch (exportState.value) {
    case 'loading':
      return '正在生成总结...'
    case 'exists':
      return '前往知识库查看'
    case 'select':
      return '选择需要附带的聊天块'
    case 'ready':
      return '前往笔记编辑'
    default:
      return '导出到知识库'
  }
})

// 按钮图标
const buttonIcon = computed(() => {
  switch (exportState.value) {
    case 'loading':
      return null
    case 'exists':
      return 'book-open-page-variant'
    case 'select':
      return 'checkbox-multiple-marked-outline'
    case 'ready':
      return 'arrow-right'
    default:
      return 'export-variant'
  }
})

/**
 * 处理按钮点击
 */
async function handleButtonClick() {
  switch (exportState.value) {
    case 'idle':
      await startExport()
      break
    case 'exists':
      navigateToDetail()
      break
    case 'select':
      showChatSelection.value = true
      break
    case 'ready':
      navigateToEdit()
      break
  }
}

/**
 * 开始导出流程 - 调用后端总结接口
 */
async function startExport() {
  const conversationId = chatStore.currentConversationId
  if (!conversationId) {
    toast.error('当前没有活跃的对话')
    return
  }

  exportState.value = 'loading'
  loading.value = true

  try {
    // 确保本地 summaries 已与后端同步（如未加载过则调用一次 list 接口）
    if (!knowledgeStore.loaded) {
      await knowledgeStore.loadSummaries(listSummaries)
    }

    // 调用后端总结接口
    const result = await summarizeConversation(conversationId)

    // 保存总结结果
    summaryResult.value = {
      id: result.sum_id,
      conversation_id: conversationId,
      summary_text: result.summary,
      tags: result.tags || [],
      tool_calls_json: result.tool_calls_json || '[]',
      notes: result.notes || {}
    }

    // 仅在本地 store 中插入/更新一条 summary 记录
    knowledgeStore.upsertSummary({
      ...summaryResult.value,
      created_at: summaryResult.value.created_at || Date.now(),
      updated_at: summaryResult.value.updated_at || Date.now()
    })

    toast.success('总结生成成功')
    // 总结生成完成后，自动进入选择阶段并弹出选择器
    exportState.value = 'select'
    showChatSelection.value = true
  } catch (error) {
    console.error('导出失败:', error)
    toast.error('导出失败：' + (error.message || '未知错误'))
    exportState.value = 'idle'
  } finally {
    loading.value = false
  }
}

/**
 * 处理聊天块选择确认
 */
function handleSelectionConfirm(selectedIds) {
  selectedMessageIds.value = selectedIds
  exportState.value = 'ready'

  // 选择完成后自动保存到后端，并给出 Toast 提示
  autoSaveToBackend().catch((err) => {
    console.error('自动保存到知识库失败:', err)
  })
}

/**
 * 处理聊天块选择取消/跳过
 */
function handleSelectionCancel() {
  selectedMessageIds.value = []
  exportState.value = 'ready'

  // 即便用户跳过选择，也将当前 AI 总结保存一次
  autoSaveToBackend().catch((err) => {
    console.error('自动保存到知识库失败(跳过选择):', err)
  })
}

/**
 * 自动保存当前 summary 到后端
 * 行为参考 NoteEditPage 中的 updateSummary 调用
 */
async function autoSaveToBackend() {
  if (!summaryResult.value?.id) return

  // 计算 notes：在原有 notes 基础上追加聊天块内容
  let notesObj = summaryResult.value.notes || { title: '对话总结' }

  if (selectedMessageIds.value.length > 0) {
    const messages = chatStore.currentMessages.filter((m) =>
      selectedMessageIds.value.includes(m.id)
    )

    const blocks = knowledgeStore.getBlocksFromNotes(notesObj)

    messages.forEach((msg, index) => {
      const blockKey = `block${blocks.length + index + 1}`
      blocks.push({
        key: blockKey,
        content: `## ${msg.role === 'user' ? '用户' : 'AI 助手'}\n\n${msg.content}`
      })
    })

    notesObj = knowledgeStore.blocksToNotesObj(notesObj.title || '对话总结', blocks)
    // 同步到本地 summaryResult，便于后续编辑页面读取
    summaryResult.value.notes = notesObj
  }

  const payload = {
    id: summaryResult.value.id,
    summary_text: summaryResult.value.summary_text,
    tags: summaryResult.value.tags || [],
    tool_calls_json: summaryResult.value.tool_calls_json || '[]',
    notes: notesObj
  }

  // 通过 knowledgeStore 统一更新，内部会调用后端并同步 summaries
  await knowledgeStore.updateSummary(payload)

  toast.success('已保存到知识库')
}

/**
 * 前往知识库编辑页面
 */
function navigateToEdit() {
  if (!summaryResult.value?.id) {
    toast.error('未找到总结信息')
    return
  }

  // 将选择的消息内容附加到 notes 中
  if (selectedMessageIds.value.length > 0) {
    const messages = chatStore.currentMessages.filter((m) =>
      selectedMessageIds.value.includes(m.id)
    )

    // 构建内容块
    const existingNotes = summaryResult.value.notes || {}
    const blocks = knowledgeStore.getBlocksFromNotes(existingNotes)

    // 将选中的消息添加为新的内容块
    messages.forEach((msg, index) => {
      const blockKey = `block${blocks.length + index + 1}`
      blocks.push({
        key: blockKey,
        content: `## ${msg.role === 'user' ? '用户' : 'AI 助手'}\n\n${msg.content}`
      })
    })

    // 更新 notes
    const updatedNotes = knowledgeStore.blocksToNotesObj(existingNotes.title || '对话总结', blocks)

    // 更新 store 中的数据
    knowledgeStore.upsertSummary({
      ...summaryResult.value,
      notes: updatedNotes,
      updated_at: Date.now()
    })
  }

  // 导航到编辑页面
  router.push({
    name: 'NoteEdit',
    params: { id: summaryResult.value.id }
  })

  // 重置状态
  reset()
}

/**
 * 重置状态
 */
function reset() {
  exportState.value = 'idle'
  loading.value = false
  summaryResult.value = null
  selectedMessageIds.value = []
  existingSummaryId.value = null
  // 重置后重新检查是否存在
  checkExistingSummary()
}

/**
 * 检查当前对话是否已有总结
 */
async function checkExistingSummary() {
  const conversationId = chatStore.currentConversationId
  if (!conversationId) {
    exportState.value = 'idle'
    existingSummaryId.value = null
    return
  }

  // 确保知识库数据已加载
  if (!knowledgeStore.loaded) {
    try {
      await knowledgeStore.loadSummaries(listSummaries)
    } catch (err) {
      console.error('加载知识库失败:', err)
      return
    }
  }

  // 查找当前对话是否已有总结
  const existingSummary = knowledgeStore.getSummaryByConversationId(conversationId)
  if (existingSummary) {
    exportState.value = 'exists'
    existingSummaryId.value = existingSummary.id
  } else {
    exportState.value = 'idle'
    existingSummaryId.value = null
  }
}

/**
 * 前往知识库详情页面
 */
function navigateToDetail() {
  if (!existingSummaryId.value) {
    toast.error('未找到总结信息')
    return
  }

  router.push({
    name: 'NoteDetail',
    params: { id: existingSummaryId.value }
  })
}

// 监听当前对话变化，检查是否已有总结
watch(
  () => chatStore.currentConversationId,
  () => {
    // 仅在 idle 或 exists 状态时重新检查
    if (exportState.value === 'idle' || exportState.value === 'exists') {
      checkExistingSummary()
    }
  },
  { immediate: false }
)

// 监听知识库 summaries 变化（如从其他页面返回时数据可能已更新）
watch(
  () => knowledgeStore.summaries,
  () => {
    // 仅在 idle 或 exists 状态时重新检查
    if (exportState.value === 'idle' || exportState.value === 'exists') {
      checkExistingSummary()
    }
  },
  { deep: true }
)

// 组件挂载时检查
onMounted(() => {
  checkExistingSummary()
})

// 从 keep-alive 缓存中激活时重新检查
onActivated(() => {
  checkExistingSummary()
})

// 暴露方法供父组件调用
defineExpose({
  reset,
  exportState
})
</script>

<template>
  <div class="export-to-knowledge">
    <var-button
      :type="exportState === 'ready' || exportState === 'exists' ? 'primary' : 'default'"
      :loading="loading"
      :disabled="loading"
      loading-type="cube"
      class="export-button rounded-btn"
      @click="handleButtonClick"
    >
      <var-icon v-if="buttonIcon && !loading" :name="buttonIcon" :size="16" class="mr-1" />
      {{ buttonText }}
    </var-button>

    <!-- 聊天记录选择器 -->
    <ChatSelection
      v-model:visible="showChatSelection"
      @confirm="handleSelectionConfirm"
      @cancel="handleSelectionCancel"
    />
  </div>
</template>

<style scoped>
.export-to-knowledge {
  display: inline-flex;
  align-items: center;
}

.export-button {
  transition: all 0.3s ease;
}
</style>
