<script setup>
import { computed } from 'vue'

const props = defineProps({
  note: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const firstBlock = computed(() => props.note.blocks?.[0] || null)

const createdAtText = computed(() => {
  const date = new Date(props.note.createdAt)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const previewContent = computed(() => {
  if (!firstBlock.value?.content) return ''
  const text = firstBlock.value.content.replace(/^#+\s*/gm, '').replace(/`{1,3}[^`]*`{1,3}/g, '')
  return text.length > 120 ? text.slice(0, 120) + '…' : text
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
            {{ note.title || '未命名笔记' }}
          </h3>
        </div>
        <span class="text-[11px] text-text-secondary whitespace-nowrap">{{ createdAtText }}</span>
      </div>

      <p class="text-sm text-text-secondary leading-relaxed line-clamp-3 whitespace-pre-wrap">
        {{ previewContent || '暂无内容' }}
      </p>

      <div class="flex items-center justify-between mt-1 text-xs text-text-tertiary">
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center gap-1">
            <var-icon name="thumb-up" :size="14" />
            <span>{{ firstBlock?.likes ?? 0 }}</span>
          </span>
          <span class="inline-flex items-center gap-1">
            <var-icon name="share" :size="14" />
            <span>{{ firstBlock?.shares ?? 0 }}</span>
          </span>
          <span class="inline-flex items-center gap-1">
            <var-icon name="message-text-outline" :size="14" />
            <span>{{ firstBlock?.comments?.length ?? 0 }}</span>
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
