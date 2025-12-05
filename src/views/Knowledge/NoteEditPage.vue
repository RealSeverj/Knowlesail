<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useKnowledgeStore } from '@/stores/knowledge'
import { useChatStore } from '@/stores/chat'
import { useToast } from '@/composables/useToast'
import { listSummaries, getSummaryDetail } from '@/api/knowledge'
import NoteEditor from '@/components/Knowledge/NoteEditor.vue'
import ChatSelection from '@/components/Home/ChatSelection.vue'

const route = useRoute()
const router = useRouter()
const knowledgeStore = useKnowledgeStore()
const chatStore = useChatStore()
const { summaries, loaded, loading } = storeToRefs(knowledgeStore)
const toast = useToast()

// 单独加载的笔记详情（用于直接访问/刷新页面的情况）
const localSummary = ref(null)
const localLoading = ref(false)

// 聊天选择器状态
const showChatSelection = ref(false)

const summaryId = computed(() => route.params.id)

// 优先从 store 中查找，如果没有则使用本地加载的数据
const summary = computed(() => {
  const fromStore = summaries.value.find((s) => s.id === summaryId.value)
  return fromStore || localSummary.value
})

// 确保数据已加载
async function ensureLoaded() {
  // 如果 store 中已有数据，直接使用
  if (summaries.value.find((s) => s.id === summaryId.value)) {
    return
  }
  
  // 尝试加载整个列表
  if (!loaded.value && !loading.value) {
    await knowledgeStore.loadSummaries(listSummaries)
  }
  
  // 如果列表中还是没有，单独获取详情
  if (!summaries.value.find((s) => s.id === summaryId.value)) {
    localLoading.value = true
    try {
      const detail = await getSummaryDetail(summaryId.value)
      if (detail) {
        localSummary.value = detail
        // 同时更新到 store 中
        knowledgeStore.upsertSummary(detail)
      }
    } catch (e) {
      console.error('加载笔记详情失败:', e)
    } finally {
      localLoading.value = false
    }
  }
}

onMounted(() => {
  ensureLoaded()
})

// 本地编辑状态
const editState = reactive({
  title: '',
  summaryText: '',
  tags: [],
  toolCallsJson: '[]',
  blocks: [] // { key: 'block1', content: '...' }
})

// 新标签输入
const newTagInput = ref('')
const saving = ref(false)

// 用于生成唯一 ID 的计数器
let blockIdCounter = 0
function generateBlockId() {
  return `block_${Date.now()}_${++blockIdCounter}`
}

// 初始化编辑状态
watch(
  summary,
  (val) => {
    if (val) {
      editState.title = val.notes?.title || ''
      editState.summaryText = val.summary_text || ''
      editState.tags = [...(val.tags || [])]
      editState.toolCallsJson = val.tool_calls_json || '[]'
      // 为每个 block 添加唯一 id
      const blocks = knowledgeStore.getBlocksFromNotes(val.notes)
      editState.blocks = blocks.map((b, i) => ({
        ...b,
        id: generateBlockId()
      }))
    }
  },
  { immediate: true }
)

function handleBack() {
  router.back()
}

function addTag() {
  const tag = newTagInput.value.trim()
  if (tag && !editState.tags.includes(tag)) {
    editState.tags.push(tag)
  }
  newTagInput.value = ''
}

function removeTag(tag) {
  editState.tags = editState.tags.filter((t) => t !== tag)
}

function addBlock() {
  const nextKey = `block${editState.blocks.length + 1}`
  editState.blocks.push({ id: generateBlockId(), key: nextKey, content: '' })
}

// 打开聊天选择器前，先加载关联对话的消息
async function openChatSelection() {
  const conversationId = summary.value?.conversation_id
  if (!conversationId) {
    toast.warning('此笔记没有关联的对话记录')
    return
  }
  
  // 切换到关联的对话以加载消息
  chatStore.switchConversation(conversationId)
  
  // 如果当前对话没有消息，尝试从后端加载
  if (!chatStore.currentMessages || chatStore.currentMessages.length === 0) {
    try {
      await chatStore.loadConversationHistory(conversationId)
    } catch (e) {
      console.error('加载对话历史失败:', e)
    }
  }
  
  showChatSelection.value = true
}

// 处理聊天选择器确认
function handleChatSelectionConfirm(selectedIds) {
  if (!selectedIds || selectedIds.length === 0) return
  
  const messages = chatStore.currentMessages || []
  const selectedMessages = messages.filter(m => selectedIds.includes(m.id))
  
  // 将选中的消息内容添加为新的内容块
  selectedMessages.forEach(msg => {
    const nextKey = `block${editState.blocks.length + 1}`
    const rolePrefix = msg.role === 'user' ? '**用户：**\n' : '**AI：**\n'
    editState.blocks.push({
      id: generateBlockId(),
      key: nextKey,
      content: rolePrefix + (msg.content || '')
    })
  })
  
  toast.success(`已添加 ${selectedMessages.length} 个内容块`)
}

function removeBlock(index) {
  editState.blocks.splice(index, 1)
  // 重新编号 key
  editState.blocks.forEach((b, i) => {
    b.key = `block${i + 1}`
  })
}

// 上移内容块
function moveBlockUp(index) {
  if (index <= 0) return
  // 使用 splice 确保响应式更新
  const [removed] = editState.blocks.splice(index, 1)
  editState.blocks.splice(index - 1, 0, removed)
  // 重新编号 key
  editState.blocks.forEach((b, i) => {
    b.key = `block${i + 1}`
  })
}

// 下移内容块
function moveBlockDown(index) {
  if (index >= editState.blocks.length - 1) return
  // 使用 splice 确保响应式更新
  const [removed] = editState.blocks.splice(index, 1)
  editState.blocks.splice(index + 1, 0, removed)
  // 重新编号 key
  editState.blocks.forEach((b, i) => {
    b.key = `block${i + 1}`
  })
}

async function handleSave() {
  if (!summary.value) return

  saving.value = true
  try {
    // 构建 notes 对象
    const notesObj = knowledgeStore.blocksToNotesObj(editState.title, editState.blocks)

    // 通过 store 统一更新 summary，本方法内部会调用后端 update 接口
    await knowledgeStore.updateSummary({
      id: summary.value.id,
      summary_text: editState.summaryText,
      tags: editState.tags,
      tool_calls_json: editState.toolCallsJson,
      notes: notesObj
    })

    toast.success('保存成功')
    router.back()
  } catch (e) {
    console.error(e)
    toast.error('保存失败：' + (e.message || '未知错误'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="note-edit-page min-h-screen bg-background flex flex-col">
    <!-- 顶部栏 -->
    <div
      class="flex items-center px-4 py-3 border-b border-border/60 bg-surface/80 backdrop-blur z-10"
    >
      <var-button text round size="small" class="mr-1" @click="handleBack">
        <var-icon name="chevron-left" :size="18" />
      </var-button>
      <div class="flex-1 min-w-0">
        <h2 class="text-base font-semibold text-foreground truncate">
          {{ editState.title || '编辑笔记' }}
        </h2>
        <p v-if="summary" class="text-[11px] text-secondary mt-0.5">
          共 {{ editState.blocks.length }} 个内容块
        </p>
      </div>
      <var-button type="primary" round size="large" :loading="saving" @click="handleSave">
        <var-icon name="check" :size="18" />
      </var-button>
    </div>

    <!-- 加载中状态 -->
    <div v-if="localLoading || loading" class="flex-1 flex items-center justify-center px-4">
      <div class="text-center">
        <var-loading type="circle" color="var(--color-primary)" />
        <p class="text-secondary text-sm mt-3">加载中...</p>
      </div>
    </div>

    <div v-else-if="!summary" class="flex-1 flex items-center justify-center px-4">
      <div class="text-center">
        <var-icon
          name="file-document-outline"
          :size="48"
          color="var(--color-primary)"
          class="mb-3"
        />
        <h3 class="text-base font-medium text-foreground mb-2">未找到笔记</h3>
        <p class="text-secondary text-xs mb-4">可能是链接失效或笔记已被删除</p>
        <var-button type="primary" round size="small" @click="handleBack">返回上一页</var-button>
      </div>
    </div>

    <div v-else class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      <!-- 标题编辑 -->
      <div class="space-y-1">
        <label class="text-[11px] text-text-tertiary">笔记标题</label>
        <var-input v-model="editState.title" placeholder="请输入笔记标题" />
      </div>

      <!-- AI 总结编辑 -->
      <div class="space-y-1">
        <label class="text-[11px] text-text-tertiary">AI 总结</label>
        <var-input
          v-model="editState.summaryText"
          textarea
          :rows="3"
          placeholder="AI 生成的总结内容"
        />
      </div>

      <!-- 标签编辑 -->
      <div class="space-y-2">
        <label class="text-[11px] text-text-tertiary">标签（点击可移除）</label>
        <div class="flex flex-wrap gap-2">
          <var-chip
            v-for="tag in editState.tags"
            :key="tag"
            size="small"
            closable
            icon-name="delete"
            @click="removeTag(tag)"
          >
            {{ tag }}
          </var-chip>
        </div>
        <div class="flex items-center gap-2">
          <var-input
            v-model="newTagInput"
            placeholder="输入新标签"
            size="small"
            class="flex-1"
            @keyup.enter="addTag"
          />
          <var-button type="primary" size="small" round @click="addTag">
            <var-icon name="plus" :size="14" />
          </var-button>
        </div>
      </div>

      <!-- 内容块列表 -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-[11px] text-text-tertiary">内容块</label>
          <div class="flex items-center gap-2">
            <var-button
              v-if="summary?.conversation_id"
              type="primary"
              size="small"
              @click="openChatSelection"
            >
              <var-icon name="message-text-outline" :size="14" class="mr-1" />
              从对话导入
            </var-button>
            <var-button
              type="primary"
              size="small"
              @click="addBlock"
            >
              <var-icon name="plus" :size="14" class="mr-1" />
              添加内容块
            </var-button>
          </div>
        </div>

        <div v-for="(block, index) in editState.blocks" :key="block.id" class="space-y-2">
          <!-- 内容块头部 -->
          <div class="flex items-center justify-between text-[11px] text-text-tertiary px-1">
            <span class="inline-flex items-center gap-1">
              <var-icon name="notebook" :size="14" />
              <span>内容块 {{ index + 1 }}</span>
            </span>
            <div class="flex items-center gap-1">
              <!-- 上移按钮 -->
              <var-button
                text
                size="small"
                :disabled="index === 0"
                @click="moveBlockUp(index)"
              >
                <var-icon name="chevron-up" :size="14" />
              </var-button>
              <!-- 下移按钮 -->
              <var-button
                text
                size="small"
                :disabled="index === editState.blocks.length - 1"
                @click="moveBlockDown(index)"
              >
                <var-icon name="chevron-down" :size="14" />
              </var-button>
              <!-- 删除按钮 -->
              <var-button
                text
                size="small"
                type="danger"
                @click="removeBlock(index)"
              >
                <var-icon name="delete" :size="14" />
              </var-button>
            </div>
          </div>

          <!-- 编辑器 -->
          <NoteEditor v-model="block.content" :block-id="block.key" class="mt-1" />
        </div>

        <div v-if="editState.blocks.length === 0" class="text-center py-6 text-text-tertiary text-sm">
          暂无内容块，点击上方按钮添加
        </div>
      </div>
    </div>

    <!-- 聊天记录选择器 -->
    <ChatSelection
      v-model:visible="showChatSelection"
      @confirm="handleChatSelectionConfirm"
    />
  </div>
</template>

<style scoped>
.note-edit-page {
  background-color: var(--color-background);
  height: 100%;
  overflow-y: auto;
  padding-bottom: 56px;
}
</style>
