<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useKnowledgeStore } from '@/stores/knowledge'
import { listSummaries, getSummaryDetail } from '@/api/knowledge'
import MarkdownRenderer from '@/components/Home/MarkdownRenderer/MarkdownRenderer.vue'

const route = useRoute()
const router = useRouter()
const knowledgeStore = useKnowledgeStore()
const { summaries, loaded, loading } = storeToRefs(knowledgeStore)

// 单独加载的笔记详情（用于直接访问/刷新页面的情况）
const localSummary = ref(null)
const localLoading = ref(false)

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

// 从 notes 对象中提取内容块
const contentBlocks = computed(() => {
  if (!summary.value?.notes) return []
  return knowledgeStore.getBlocksFromNotes(summary.value.notes)
})

// 笔记标题
const noteTitle = computed(() => summary.value?.notes?.title || '未命名笔记')

// 标签
const tags = computed(() => summary.value?.tags || [])

function handleBack() {
  router.back()
}

function handleEdit() {
  router.push({ name: 'NoteEdit', params: { id: summaryId.value } })
}

function goToConversation() {
  if (summary.value?.conversation_id) {
    router.push({ name: 'Chat', params: { conversationId: summary.value.conversation_id } })
  }
}

async function generateImage(prompt) {
  console.log('generate image from note block:', prompt)
  return null
}
</script>

<template>
  <div class="note-detail-page min-h-screen bg-background flex flex-col">
    <!-- 顶部栏：返回 + 标题 + 作者信息 -->
    <div
      class="flex items-center px-4 py-3 border-b border-border/60 bg-surface/80 backdrop-blur z-10"
    >
      <var-button text round size="small" class="mr-1" @click="handleBack">
        <var-icon name="chevron-left" :size="18" />
      </var-button>
      <div class="flex-1 min-w-0">
        <h2 class="text-base font-semibold text-foreground truncate">
          {{ noteTitle }}
        </h2>
        <div v-if="summary" class="flex items-center gap-2 mt-0.5 text-[11px] text-secondary">
          <span>
            创建于
            {{
              new Date(summary.created_at).toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })
            }}
          </span>
          <span class="text-border">•</span>
          <span>共 {{ contentBlocks.length }} 个内容块</span>
        </div>
      </div>
      <!-- 回到原始对话按钮 -->
      <var-button
        v-if="summary?.conversation_id"
        text
        class="rounded-btn"
        @click="goToConversation"
      >
        <var-icon name="message-text-outline" :size="18" class="mr-1" />
        原对话
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
      <!-- AI 总结卡片 -->
      <div class="px-4 py-3 rounded-2xl bg-surface shadow-card-soft">
        <div class="flex items-center gap-2 mb-2">
          <var-icon name="robot" :size="16" class="text-primary" />
          <span class="text-xs font-medium text-primary">AI 总结</span>
        </div>
        <p class="text-sm text-text-secondary leading-relaxed">
          {{ summary.summary_text }}
        </p>
      </div>

      <!-- 标签 -->
      <div v-if="tags.length" class="flex flex-wrap gap-2">
        <var-chip v-for="tag in tags" :key="tag" size="small" class="text-xs">
          {{ tag }}
        </var-chip>
      </div>

      <!-- 笔记统计信息卡片 -->
      <div
        class="px-4 py-3 rounded-2xl bg-surface shadow-card-soft flex items-center justify-between text-xs text-text-secondary"
      >
        <div class="flex items-center gap-4">
          <span class="inline-flex items-center gap-1">
            <var-icon name="file-document-outline" :size="16" />
            <span>{{ contentBlocks.length }} 个内容块</span>
          </span>
        </div>
        <div>
          <var-button text size="small" class="rounded-xl" type="primary">
            <var-icon name="share" :size="16" class="mr-0.5" />
            分享
          </var-button>
          <var-button text size="small" class="rounded-xl" type="primary" @click="handleEdit">
            <var-icon name="wrench" :size="14" class="mr-0.5" />
            编辑
          </var-button>
        </div>
      </div>

      <!-- 内容块列表 -->
      <div
        v-for="(block, index) in contentBlocks"
        :key="block.key"
        class="rounded-2xl bg-surface shadow-card-soft overflow-hidden"
      >
        <!-- 块头部 -->
        <div
          class="px-4 pt-3 pb-2 flex items-center justify-between text-[11px] text-text-tertiary"
        >
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1">
              <var-icon name="notebook" :size="14" />
              <span>内容块 {{ index + 1 }}</span>
            </span>
          </div>
        </div>

        <!-- Markdown 内容 -->
        <div class="px-4 pb-3 pt-1 text-text-primary text-[15px] whitespace-pre-wrap">
          <MarkdownRenderer
            :content="block.content"
            :message-id="block.key"
            :streaming="false"
            :tool-calls="[]"
            :generate-image="generateImage"
            color="var(--color-primary)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.note-detail-page {
  background-color: var(--color-background);
  height: 100%;
  overflow-y: auto;
  padding-bottom: 56px;
}
</style>
