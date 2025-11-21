<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useKeyboardOffset } from '@/composables/useKeyboardOffset'

const { keyboardOffset } = useKeyboardOffset()
const finalOffset = computed(() => (keyboardOffset.value ? keyboardOffset.value + 12 : 80))

const props = defineProps({
  expanded: {
    type: Boolean,
    default: false
  },
  keyboardOffset: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['request-expand', 'request-collapse', 'height-change'])

const chatStore = useChatStore()
const expanded = computed(() => props.expanded)

const textareaRows = ref(1)
const inputText = ref('')
const MAX_ROWS = 5
const shellRef = ref(null)
let resizeObserver = null

const isStreaming = computed(() => chatStore.isStreaming)
const canSend = computed(() => inputText.value.trim().length > 0 && !isStreaming.value)

const syncTextareaRows = () => {
  const lineCount = inputText.value.split('\n').length
  textareaRows.value = Math.min(Math.max(lineCount, 1), MAX_ROWS)
}

watch(inputText, syncTextareaRows, { immediate: true })

const emitHeight = () => {
  nextTick(() => {
    const height = expanded.value && shellRef.value ? shellRef.value.offsetHeight : 0
    emit('height-change', height)
  })
}

const initResizeObserver = () => {
  if (typeof ResizeObserver === 'undefined' || !shellRef.value) return
  resizeObserver = new ResizeObserver(() => {
    emitHeight()
  })
  resizeObserver.observe(shellRef.value)
}

watch([expanded, textareaRows], emitHeight)

onMounted(() => {
  nextTick(() => {
    initResizeObserver()
    emitHeight()
  })
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  emit('height-change', 0)
})

const handleEnter = (event) => {
  if (!event.shiftKey && canSend.value) {
    event.preventDefault()
    handleSend()
  }
}

const handleSend = async () => {
  if (!canSend.value) return

  const payload = inputText.value.trim()
  inputText.value = ''
  textareaRows.value = 1

  try {
    await chatStore.sendMessage(payload)
  } catch (error) {
    console.error('发送消息失败', error)
  }
}

const handleStop = () => {
  chatStore.stopStreaming()
}

const handleVoiceInput = () => {
  console.info('语音输入占位: 待接入语音识别能力')
}

const handleExpand = () => {
  emit('request-expand')
}
</script>

<template>
  <div class="floating-input-layer">
    <div
      ref="shellRef"
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
              @click="handleVoiceInput"
            >
              <var-icon name="plus-circle-outline" :size="24" />
            </var-button>

            <var-button v-if="isStreaming" type="danger" round class="send-btn" @click="handleStop">
              <var-icon name="window-close" :size="20" />
            </var-button>

            <var-button
              v-else
              type="primary"
              round
              class="send-btn"
              :disabled="!canSend"
              @click="handleSend"
            >
              <var-icon name="chevron-right" :size="20" />
            </var-button>
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
    background 0.25s ease,
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
  background: var(--color-surface);
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
  align-items: flex-end;
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
