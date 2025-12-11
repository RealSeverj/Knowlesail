<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useKnowledgeStore } from '@/stores/knowledge'

const route = useRoute()
const router = useRouter()
const knowledgeStore = useKnowledgeStore()

const loading = ref(false)
const error = ref('')
const items = ref([])
const keyword = ref(route.query.q || '')

async function doSearch() {
  const q = String(keyword.value || '')
    .trim()
    .toLowerCase()
  if (!q) {
    items.value = []
    return
  }

  loading.value = true
  error.value = ''

  try {
    const allSummaries = Array.isArray(knowledgeStore.summaries) ? knowledgeStore.summaries : []

    // 在本地 summaries 中做简单全文搜索（标题 + 各个内容块 + summary_text）
    const matched = allSummaries.filter((s) => {
      const notes = s.notes || {}
      const title = String(notes.title || '').toLowerCase()
      const summaryText = String(s.summary_text || '').toLowerCase()

      let blocksText = ''
      let i = 1
      while (notes[`block${i}`] !== undefined) {
        blocksText += `\n${String(notes[`block${i}`])}`
        i++
      }
      blocksText = blocksText.toLowerCase()

      return title.includes(q) || summaryText.includes(q) || blocksText.includes(q)
    })

    // 映射为用于展示的 item 结构
    items.value = matched.map((raw) => {
      const notes = raw.notes || {}

      const title = notes.title || raw.summary_text || '未命名笔记'

      let snippetSource = ''
      if (notes.block1) {
        snippetSource = String(notes.block1)
      } else if (raw.summary_text) {
        snippetSource = String(raw.summary_text)
      } else {
        snippetSource = ''
      }

      const cleaned = snippetSource.replace(/[#>*`-]/g, '').trim()
      const snippet = cleaned.slice(0, 80)

      return {
        id: raw.id,
        type: 'note',
        source: '我的笔记',
        title,
        snippet
      }
    })
  } catch (e) {
    console.error(e)
    error.value = '搜索失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

watch(
  () => route.query.q,
  (q) => {
    keyword.value = q || ''
    doSearch()
  },
  { immediate: true }
)

function handleItemClick(item) {
  if (item.type === 'note') {
    router.push({ name: 'NoteDetail', params: { id: item.id } })
  } else if (item.type === 'official') {
    router.push({ name: 'OfficialKnowledge' })
  } else if (item.type === 'community') {
    router.push({ name: 'CommunityKnowledge' })
  }
}
</script>

<template>
  <div class="ks-search-results px-4 pt-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex-1 min-w-0">
        <p class="text-xs text-text-secondary truncate">
          搜索关键字：
          <span class="font-medium text-text-primary">{{ keyword || '（暂无）' }}</span>
        </p>
      </div>
    </div>

    <div v-if="loading" class="py-8 text-center text-xs text-text-secondary">正在搜索中…</div>
    <div v-else-if="error" class="py-8 text-center text-xs text-error">
      {{ error }}
    </div>
    <div v-else-if="!items.length" class="py-8 text-center text-xs text-text-tertiary">
      暂无搜索结果，试试换个关键词？
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="item in items"
        :key="item.id + item.type"
        class="rounded-2xl bg-surface shadow-card-soft px-4 py-3 cursor-pointer hover:shadow-lg transition-shadow"
        @click="handleItemClick(item)"
      >
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-1 min-w-0">
            <var-chip size="small" type="primary" class="mr-1" :plain="item.type !== 'note'">
              {{ item.source }}
            </var-chip>
            <h3 class="text-sm font-semibold text-text-primary truncate">
              {{ item.title }}
            </h3>
          </div>
        </div>
        <p class="mt-1 text-xs text-text-secondary leading-relaxed line-clamp-2">
          {{ item.snippet }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ks-search-results {
  min-height: 50vh;
}

.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
