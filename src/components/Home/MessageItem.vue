<script setup>
import { ref } from 'vue'
import MarkdownRenderer from './MarkdownRenderer/MarkdownRenderer.vue'
import { Snackbar } from '@varlet/ui'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['export'])

// 图片预览状态
const showImagePreview = ref(false)

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

// 打开图片预览
function openImagePreview() {
  showImagePreview.value = true
}

// 关闭图片预览
function closeImagePreview() {
  showImagePreview.value = false
}
</script>

<template>
  <div class="group px-4 transition-colors rounded-xl">
    <!-- 头部：头像 + 名称 + 时间 -->
    <div
      class="flex items-center gap-3 mb-3"
      :class="message.role === 'user' ? 'flex-row-reverse' : ''"
    >
      <!-- 头像 -->
      <div
        class="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-all"
        :class="
          message.role === 'user'
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
            : 'bg-gradient-to-br from-blue-600 to-blue-400'
        "
      >
        <var-icon :name="message.role === 'user' ? 'account' : 'robot'" :size="20" />
      </div>
      <!-- 名称和时间 -->
      <div
        class="flex items-center gap-2"
        :class="message.role === 'user' ? 'flex-row-reverse' : ''"
      >
        <span class="font-semibold text-sm text-text-primary">{{
          message.role === 'user' ? '你' : 'AI 助手'
        }}</span>
        <span class="text-xs text-text-secondary">{{ formatTime(message.timestamp) }}</span>
      </div>
    </div>

    <!-- 内容区：占满宽度 -->
    <div class="w-full">
      <!-- 内容 -->
      <div
        class="relative leading-relaxed break-words"
        :class="message.role === 'user' ? 'flex flex-col items-end' : ''"
      >
        <div
          v-if="message.role === 'user'"
          class="message-bubble inline-block max-w-[85%] px-4 py-3 rounded-xl text-text-primary text-[15px] whitespace-pre-wrap transition-colors"
        >
          {{ message.content }}
        </div>

        <!-- 用户发送的图片 -->
        <div
          v-if="message.role === 'user' && message.hasImage && message.imagePreview"
          class="mt-2 max-w-[85%]"
        >
          <div
            class="user-image-container rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
            @click="openImagePreview"
          >
            <img
              :src="message.imagePreview"
              alt="用户上传的图片"
              class="user-image"
            />
            <div class="image-overlay">
              <var-icon name="window-close" :size="24"/>
            </div>
          </div>
        </div>

        <div v-if="message.role === 'assistant'" class="message-bubble inline-block max-w-full px-4 rounded-xl transition-colors">
          <MarkdownRenderer
            :content="message.content"
            :message-id="message.id"
            :streaming="message.streaming"
            :tool-calls="message.toolCalls || []"
            :generate-image="generateImage"
            color="var(--color-primary)"
          />
        </div>
        <span
          v-if="message.streaming"
          class="inline-block w-[2px] h-[1.2em] bg-primary ml-[2px] align-bottom animate-blink"
        ></span>
      </div>

      <!-- 操作按钮 -->
      <div
        v-if="!message.streaming"
        class="flex gap-1 mt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        :class="message.role === 'user' ? 'justify-end' : ''"
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
          <var-icon name="plus" :size="16" />
        </var-button>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <teleport to="body">
      <transition name="fade">
        <div
          v-if="showImagePreview && message.hasImage && message.imagePreview"
          class="image-preview-modal"
          @click="closeImagePreview"
        >
          <div class="preview-content" @click.stop>
            <img :src="message.imagePreview" alt="图片预览" class="preview-image" />
            <button class="close-btn" @click="closeImagePreview">
              <var-icon name="window-close" :size="24" color="#fff" />
            </button>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<style scoped>
.message-bubble {
  background-color: color-mix(in srgb, var(--color-surface) 75%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

/* 用户图片样式 */
.user-image-container {
  position: relative;
  display: inline-block;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.user-image {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  display: block;
  border-radius: 12px;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: 12px;
}

.user-image-container:hover .image-overlay {
  opacity: 1;
}

/* 图片预览弹窗 */
.image-preview-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.preview-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.preview-image {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
