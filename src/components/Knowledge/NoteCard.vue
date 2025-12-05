<script setup>
import { computed } from 'vue'

const props = defineProps({
  note: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

// 从 notes 对象中获取第一个内容块
const firstBlockContent = computed(() => {
  const notesObj = props.note.notes
  if (!notesObj || typeof notesObj !== 'object') return ''
  return notesObj.block1 || ''
})

// 笔记标题
const noteTitle = computed(() => props.note.notes?.title || '未命名笔记')

// 标签
const tags = computed(() => props.note.tags || [])

// 创建时间
const createdAtText = computed(() => {
  const date = new Date(props.note.created_at)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// 预览内容：优先显示 summary_text，否则显示第一个内容块
const previewContent = computed(() => {
  const summary = props.note.summary_text
  if (summary) {
    return summary.length > 120 ? summary.slice(0, 120) + '…' : summary
  }
  const text = firstBlockContent.value.replace(/^#+\s*/gm, '').replace(/`{1,3}[^`]*`{1,3}/g, '')
  return text.length > 120 ? text.slice(0, 120) + '…' : text
})

// 计算内容块数量
const blockCount = computed(() => {
  const notesObj = props.note.notes
  if (!notesObj || typeof notesObj !== 'object') return 0
  let count = 0
  let i = 1
  while (notesObj[`block${i}`] !== undefined) {
    count++
    i++
  }
  return count
})

function handleClick() {
  emit('click', props.note)
}
</script>

<template>
  <var-card
    class="ks-note-card w-full mb-3 shadow-card-soft rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
    ripple
    @click="handleClick"
  >
    <div class="p-4 flex flex-col gap-2">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <var-icon name="notebook" :size="20" class="text-primary" />
          <h3 class="text-base font-semibold text-foreground truncate">
            {{ noteTitle }}
          </h3>
        </div>
        <span class="text-[11px] text-text-secondary whitespace-nowrap">{{ createdAtText }}</span>
      </div>

      <!-- 标签 -->
      <div v-if="tags.length" class="flex flex-wrap gap-1">
        <var-chip
          v-for="tag in tags.slice(0, 3)"
          :key="tag"
          size="mini"
          class="text-[10px]"
        >
          {{ tag }}
        </var-chip>
        <span v-if="tags.length > 3" class="text-[10px] text-text-tertiary">
          +{{ tags.length - 3 }}
        </span>
      </div>

      <p class="text-sm text-text-secondary leading-relaxed line-clamp-3 whitespace-pre-wrap">
        {{ previewContent || '暂无内容' }}
      </p>

      <div class="flex items-center justify-between mt-1 text-xs text-text-tertiary">
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center gap-1">
            <var-icon name="file-document-outline" :size="14" />
            <span>{{ blockCount }} 个内容块</span>
          </span>
        </div>
        <div class="flex items-center gap-1 text-primary">
          <span>查看详情</span>
          <var-icon name="chevron-right" :size="14" />
        </div>
      </div>
    </div>
  </var-card>
</template>

<style scoped>
.ks-note-card {
  /* 使用 Varlet Card 暴露的主题变量，统一适配亮暗色 */
  --card-background: var(--color-surface);
  --card-outline-color: var(--color-border);
  --card-content-color: var(--color-text-secondary);
  --card-subtitle-color: var(--color-text-tertiary);
  --card-description-color: var(--color-text-secondary);
}

.line-clamp-3 {
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
