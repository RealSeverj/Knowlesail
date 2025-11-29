<script setup>
import { ref, useTemplateRef } from 'vue'
import { visualizationLibs } from '@/config/visualization-libs.config' // 可视化库配置
import { useLibraryCache } from '@/composables/useLibraryCache' // 缓存管理器
import Htmath from './Htmath.vue'
import FullScreenViewer from './FullScreenViewer.vue'
const { libBlobs } = useLibraryCache()

const props = defineProps({
  html: {
    type: String,
    required: true
  }
})
const emits = defineEmits(['updateHeight'])

// 替换html中的库引用为缓存的url
function replaceWithCachedLibs(html) {
  let processedHtml = html

  // 遍历所有可视化库配置
  visualizationLibs.forEach((lib) => {
    // 检查是否有缓存的blobUrl
    if (libBlobs[lib.id]) {
      // 处理所有匹配模式
      ;(lib.patterns || []).forEach((pattern) => {
        try {
          // 构建正则表达式（支持全局匹配）
          const regex = new RegExp(pattern, 'g')
          // 替换为缓存的blobUrl
          processedHtml = processedHtml.replace(regex, libBlobs[lib.id])
        } catch (error) {
          console.error(`解析模式 ${pattern} 失败:`, error)
        }
      })
    }
  })

  return processedHtml
}

const wrapperRef = useTemplateRef('wrapperRef')
const loading = ref(true)
function updateHeight() {
  wrapperRef.value.style.height = 'auto'
  loading.value = false
  emits('updateHeight')
}

// 全屏查看
const isFullScreen = ref(false)
function fullScreen() {
  isFullScreen.value = true
}
</script>

<template>
  <div ref="wrapperRef" class="htmath-wrapper">
    <div class="header">
      <div class="title">可视化面板</div>
      <svg
        v-if="!loading"
        class="full-screen-btn"
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        fill="none"
        viewBox="0 0 24 24"
        @click.stop="fullScreen"
      >
        <path
          fill="currentColor"
          d="M22 3v7a1 1 0 1 1-2 0V4h-6a1 1 0 1 1 0-2h7a1 1 0 0 1 1 1M11.005 21a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-7a1 1 0 0 1 2.002 0v6h6.003a1 1 0 0 1 1 1"
        ></path>
      </svg>
    </div>

    <Htmath :html="replaceWithCachedLibs(html)" :use-thumb="true" @finished="updateHeight"></Htmath>

    <!-- 全屏查看 -->
    <FullScreenViewer v-model="isFullScreen" :html="replaceWithCachedLibs(html)"></FullScreenViewer>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  display: block; /* 覆盖全局的display: none */
  width: 6px; /* 纵向滚动条宽度 */
  height: 6px; /* 横向滚动条高度 */
  background: #f3f4f6; /* 滚动条背景色 */
}
::-webkit-scrollbar-thumb {
  border-radius: 3px; /* 滑块圆角 */
  background: #ccc; /* 滑块颜色 */
  transition: background 0.2s;
}

.htmath-wrapper {
  position: relative;
  width: 100%;
  height: 115px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
}

.header {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  width: 100%;
  height: 30px;
  padding: 0 10px;
  font-size: 14px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  line-height: 1.5;
  color: var(--color-text-secondary);
  background-color: #f3f4f6;
}

.full-screen-btn {
  cursor: pointer;
}
</style>
