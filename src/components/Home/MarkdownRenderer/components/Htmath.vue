<script setup>
import { ref, nextTick, useTemplateRef, watch, onBeforeUnmount, computed } from 'vue'
import { html2png } from '@/utils/common'

const props = defineProps({
  html: {
    type: String,
    required: true
  },
  useThumb: {
    type: Boolean,
    default: false
  }
})
const iframeRef = useTemplateRef('iframeRef')
const emits = defineEmits(['finished'])
const loading = ref(true)

const thumbUrl = ref(null)
// 清理失效缩略图
function revokeThumb() {
  if (thumbUrl.value) URL.revokeObjectURL(thumbUrl.value)
}
// 获取iframe缩略图
async function getThumb() {
  try {
    const element = iframeRef.value.contentDocument.body
    const url = await html2png(element)
    if (!url) return null
    revokeThumb()
    return url
  } catch {
    return null
  }
}

defineExpose({ getThumb })

function handleRender(iframe) {
  try {
    loading.value = true
    const iframeDoc = iframe.contentDocument

    // 清除之前的事件监听，避免重复触发
    iframe.contentWindow.onload = null

    iframeDoc.open()
    iframeDoc.writeln(props.html)
    iframeDoc.close()

    const watchHeight = () => {
      loading.value = true

      let lastHeight = 0
      let stableCount = -1 // 高度监听器
      // 启动定时器监测高度变化
      let heightCheckTimer = setInterval(() => {
        const currentHeight = iframeDoc.documentElement.scrollHeight

        if (currentHeight !== lastHeight) {
          stableCount = -1
          lastHeight = currentHeight
          iframe.style.height = currentHeight + 'px'
        }
        stableCount++

        if (stableCount >= 5) {
          // 高度稳定
          clearInterval(heightCheckTimer)
          heightCheckTimer = null
          nextTick(async () => {
            if (props.useThumb) {
              // 生成缩略图
              revokeThumb()
              thumbUrl.value = await getThumb()
            }
            loading.value = false
            nextTick(() => {
              emits('finished')
            })
          })
        }
      }, 100)
    }

    // 监听iframe内容加载完成事件
    iframe.contentWindow.onload = watchHeight
  } catch (err) {
    return console.log(err)
  }
}

watch(
  () => iframeRef.value,
  (iframe) => {
    if (!iframe) return
    handleRender(iframe)
  },
  { immediate: true } // 初始加载时立即检查
)

onBeforeUnmount(() => {
  revokeThumb()
})

const iframeStyle = computed(() => {
  const style = {}
  if (loading.value) {
    // 保持渲染但不可见
    style.visibility = 'hidden'
    style.pointerEvents = 'none'
  }
  if (props.useThumb && thumbUrl.value) {
    // 已有缩略图时去除 iframe 布局显示，避免占位
    style.display = 'none'
  }
  return style
})
</script>

<template>
  <div class="htmath">
    <div v-if="loading" class="loading">
      <div class="loading-indicator">
        <div class="spinner"></div>
        <span>正在加载可视化</span>
      </div>
    </div>

    <iframe
      ref="iframeRef"
      width="100%"
      height="0"
      frameborder="0"
      class="iframe"
      :style="iframeStyle"
    ></iframe>
    <img v-if="useThumb" class="thumb" :src="thumbUrl" style="height: auto" />
  </div>
</template>

<style scoped>
.thumb {
  margin: 0;
  padding: 0;
}

.iframe {
  min-width: 768px;
  transition: height 0.3s ease;
  background-color: #fff;
}

/* iframe 加载动画 */
.loading {
  width: fit-content;
  margin: auto;
  padding-top: 20px;
}
.loading-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  padding: 10px 14px;
  background: rgba(240, 240, 240, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 20px;
  color: #666;
  font-size: 14px;

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #ccc;
    border-top-color: #1a73e8;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
