<script setup>
import { ref, computed, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useKeyboardOffset } from '@/composables/useKeyboardOffset'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

const keyboardOffset = useKeyboardOffset()
const finalOffset = computed(() => (keyboardOffset.value ? keyboardOffset.value + 12 : 80))

const expanded = defineModel({
  type: Boolean,
  default: false
})

const emit = defineEmits(['request-expand', 'request-collapse'])

const chatStore = useChatStore()

const textareaRows = ref(1)
const inputText = ref('')
const MAX_ROWS = 5
const isStreaming = computed(() => chatStore.isStreaming)
const canSend = computed(() => inputText.value.trim().length > 0 && !isStreaming.value)

// 图片相关状态
const selectedImage = ref(null) // { webPath, base64, format }

// 带图片也可以发送
const canSendWithImage = computed(
  () => (inputText.value.trim().length > 0 || selectedImage.value) && !isStreaming.value
)

const syncTextareaRows = () => {
  const lineCount = inputText.value.split('\n').length
  textareaRows.value = Math.min(Math.max(lineCount, 1), MAX_ROWS)
}

watch(inputText, syncTextareaRows, { immediate: true })

const handleEnter = (event) => {
  if (!event.shiftKey && canSendWithImage.value) {
    event.preventDefault()
    handleSend()
  }
}

const handleSend = async () => {
  if (!canSendWithImage.value) return

  const payload = inputText.value.trim()
  const imageToSend = selectedImage.value

  inputText.value = ''
  textareaRows.value = 1
  selectedImage.value = null

  try {
    await chatStore.sendMessage(payload, imageToSend)
  } catch (error) {
    console.error('发送消息失败', error)
  }
}

const handleStop = () => {
  chatStore.stopStreaming()
}

// 处理图片输入 - 调用 Capacitor Camera
const handleImageInput = async () => {
  try {
    // 检查并请求权限
    const permissions = await Camera.checkPermissions()
    if (permissions.camera !== 'granted' || permissions.photos !== 'granted') {
      const requested = await Camera.requestPermissions()
      if (requested.camera === 'denied' && requested.photos === 'denied') {
        console.warn('相机和相册权限被拒绝')
        return
      }
    }

    // 弹出选择框：拍照或从相册选择
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt,
      promptLabelHeader: '选择图片',
      promptLabelCancel: '取消',
      promptLabelPhoto: '从相册选择',
      promptLabelPicture: '拍照'
    })

    if (photo) {
      selectedImage.value = {
        base64: photo.base64String,
        webPath: photo.webPath,
        format: photo.format || 'jpeg',
        dataUrl: `data:image/${photo.format || 'jpeg'};base64,${photo.base64String}`
      }
    }
  } catch (error) {
    // 用户取消选择不算错误
    if (error.message?.includes('cancelled') || error.message?.includes('User cancelled')) {
      return
    }
    console.error('选择图片失败:', error)
  }
}

// 移除已选择的图片
const removeSelectedImage = () => {
  selectedImage.value = null
}

const handleVoiceInput = () => {
  console.info('语音输入占位: 待接入语音识别能力')
}

const handleExpand = () => {
  emit('request-expand')
}
</script>

<template>
  <div class="floating-input-layer" @focusout="expanded = false" @click="expanded = true">
    <div
      class="morph-shell"
      :class="{ 'is-expanded': expanded, 'is-streaming': isStreaming }"
      :style="{ bottom: finalOffset + 'px' }"
    >
      <button
        v-if="!expanded"
        type="button"
        class="morph-trigger"
        :disabled="isStreaming"
        @click="handleExpand"
      >
        <var-icon name="chat-processing" :size="28" />
        <span class="sr-only">展开输入框</span>
      </button>

      <transition name="input-panel-fade">
        <div v-if="expanded" class="input-inner">
          <!-- 已选择的图片预览 -->
          <div v-if="selectedImage" class="image-preview-container">
            <div class="image-preview">
              <img :src="selectedImage.dataUrl" alt="已选择的图片" class="preview-image" />
              <button type="button" class="remove-image-btn" @click="removeSelectedImage">
                <var-icon name="close-circle" :size="20" />
              </button>
            </div>
          </div>

          <!-- 底部输入区域 -->
          <div class="input-row">
            <var-input
              v-model="inputText"
              placeholder="Shift + Enter 换行，Enter 发送"
              textarea
              :rows="textareaRows"
              :maxlength="2000"
              class="flex-1 text-base input-box"
              spellcheck="false"
              @keydown.enter.exact="handleEnter"
            />

            <div class="action-group">
              <var-button
                text
                round
                class="icon-btn"
                :disabled="isStreaming"
                @click="handleImageInput"
              >
                <var-icon name="image-outline" :size="24" />
              </var-button>

              <var-button
                v-if="isStreaming"
                type="danger"
                round
                class="send-btn"
                @click="handleStop"
              >
                <var-icon name="window-close" :size="20" />
              </var-button>

              <var-button
                v-else
                type="primary"
                round
                class="send-btn"
                :disabled="!canSendWithImage"
                @click="handleSend"
              >
                <var-icon name="chevron-right" :size="20" />
              </var-button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.floating-input-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 60;
}

.morph-shell {
  position: absolute;
  right: 24px;
  width: 64px;
  max-height: 64px;
  min-height: 64px;
  border-radius: 999px;
  background: var(--color-primary);
  box-shadow: 0 5px 15px rgba(15, 23, 42, 0.25);
  pointer-events: auto;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: bottom right;
  transition:
    width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    border-radius 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    padding 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.morph-shell.is-streaming:not(.is-expanded) {
  opacity: 0.85;
}

.morph-shell.is-expanded {
  left: 0;
  right: 0;
  width: min(768px, calc(100% - 32px));
  margin: 0 auto;
  padding: 16px;
  border-radius: 20px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 5px rgba(15, 23, 42, 0.15);
  max-height: 1000px;
}

.morph-trigger {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  color: var(--color-white, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.morph-trigger:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.input-box {
  flex: 1 1 auto;
  min-width: 0;
}

.input-inner {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  border-radius: 16px;
  background: transparent;
  border: none;
  box-shadow: none;
}

/* 图片预览样式 */
.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}

.image-preview {
  position: relative;
  display: inline-block;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: var(--color-surface-variant);
}

.preview-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.remove-image-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

/* 底部输入区域 */
.input-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  width: 100%;
}

.input-panel-fade-enter-active,
.input-panel-fade-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.input-panel-fade-enter-from,
.input-panel-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

:deep(.var-input__textarea) {
  border-radius: 16px;
  background: var(--color-surface);
  padding: 12px 16px;
  font-size: 15px;
  line-height: 1.5;
  border: 1px solid transparent;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

:deep(.var-input__textarea:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.action-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-btn,
.send-btn {
  width: 44px !important;
  height: 44px !important;
  padding: 0 16px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.icon-btn {
  width: 44px !important;
  padding: 0 !important;
}

.collapse-btn {
  color: var(--color-text-secondary) !important;
}

:deep(.var-button__content) {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
