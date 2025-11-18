<script setup>
import MarkdownRenderer from './MarkdownRenderer/MarkdownRenderer.vue'
import { Snackbar } from '@varlet/ui'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['export'])

// 格式化时间
function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // 1分钟内
  if (diff < 60000) {
    return '刚刚'
  }
  // 1小时内
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`
  }
  // 今天
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  // 其他
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 复制消息
async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.message.content)
    Snackbar.success('已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    Snackbar.error('复制失败')
  }
}

// 导出到知识库
function handleExport() {
  emit('export', props.message)
}

// 图片生成（占位）
async function generateImage(prompt) {
  console.log('生成图片:', prompt)
  return null
}
</script>

<template>
  <div class="group flex gap-3 p-4 my-2 transition-colors rounded-xl">
    <!-- 头像 -->
    <div class="flex-shrink-0">
      <div
        class="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all"
        :class="
          message.role === 'user'
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
            : 'bg-gradient-to-br from-blue-600 to-blue-400'
        "
      >
        <var-icon :name="message.role === 'user' ? 'account' : 'robot'" :size="24" />
      </div>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 min-w-0">
      <!-- 头部 -->
      <div class="flex items-center gap-3 mb-2">
        <span class="font-semibold text-sm text-text-primary">{{
          message.role === 'user' ? '你' : 'AI 助手'
        }}</span>
        <span class="text-xs text-text-secondary">{{ formatTime(message.timestamp) }}</span>
      </div>

      <!-- 内容 -->
      <div class="relative leading-relaxed break-words">
        <div
          v-if="message.role === 'user'"
          class="px-4 py-3 bg-surface rounded-xl shadow-card-soft text-text-primary text-[15px] whitespace-pre-wrap transition-colors"
        >
          {{ message.content }}
        </div>
        <MarkdownRenderer
          v-else
          :content="message.content"
          :message-id="message.id"
          :streaming="message.streaming"
          :tool-calls="message.toolCalls || []"
          :generate-image="generateImage"
        />
        <span
          v-if="message.streaming"
          class="inline-block w-[2px] h-[1.2em] bg-primary ml-[2px] align-bottom animate-blink"
        ></span>
      </div>

      <!-- 操作按钮 -->
      <div
        v-if="!message.streaming"
        class="flex gap-1 mt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
      >
        <var-button
          text
          round
          size="small"
          class="text-text-secondary hover:text-primary hover:bg-surface"
          @click="handleCopy"
        >
          <var-icon name="content-copy" :size="16" />
        </var-button>
        <var-button
          v-if="message.role === 'assistant'"
          text
          round
          size="small"
          class="text-text-secondary hover:text-primary hover:bg-surface"
          @click="handleExport"
        >
          <var-icon name="book-plus" :size="16" />
        </var-button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
