<template>
  <div class="input-box-container">
    <!-- 输入框区域 -->
    <div class="input-wrapper">
      <var-input
        v-model="inputText"
        placeholder="输入消息..."
        textarea
        :rows="inputRows"
        :maxlength="2000"
        class="input-field"
        @keydown.enter.exact="handleEnter"
        @input="handleInput"
      />

      <!-- 操作按钮组 -->
      <div class="button-group">
        <!-- 语音输入按钮 -->
        <var-button
          text
          round
          class="action-btn icon-btn"
          @click="handleVoiceInput"
          :disabled="isStreaming"
        >
          <var-icon name="plus-circle" :size="20" />
        </var-button>

        <!-- 停止生成按钮 -->
        <var-button
          v-if="isStreaming"
          type="danger"
          round
          class="action-btn send-btn"
          @click="handleStop"
        >
          <var-icon name="window-close" :size="20" />
          <span class="btn-text">停止</span>
        </var-button>

        <!-- 发送按钮 -->
        <var-button
          v-else
          type="primary"
          round
          class="action-btn send-btn"
          @click="handleSend"
          :disabled="!canSend || isStreaming"
        >
          <var-icon name="chevron-right" :size="20" />
          <span class="btn-text">发送</span>
        </var-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

const inputText = ref('')
const inputRows = ref(1)

const isStreaming = computed(() => chatStore.isStreaming)
const canSend = computed(() => inputText.value.trim().length > 0)

// 自动调整输入框高度
function handleInput() {
  const lines = inputText.value.split('\n').length
  inputRows.value = Math.min(Math.max(lines, 1), 5)
}

// 处理回车发送
function handleEnter(e) {
  if (!e.shiftKey && canSend.value && !isStreaming.value) {
    e.preventDefault()
    handleSend()
  }
}

// 发送消息
async function handleSend() {
  if (!canSend.value || isStreaming.value) return

  const message = inputText.value.trim()
  inputText.value = ''
  inputRows.value = 1

  try {
    await chatStore.sendMessage(message)
  } catch (error) {
    console.error('发送消息失败:', error)
  }
}

// 停止生成
function handleStop() {
  chatStore.stopStreaming()
}

// 语音输入（待实现）
function handleVoiceInput() {
  console.log('语音输入功能待实现')
  // TODO: 集成语音输入功能
}
</script>

<style scoped>
/* 输入框容器 - 固定在底部,在底部导航之上 */
.input-box-container {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--color-body);
  border-top: 1px solid var(--color-border);
  padding: 12px 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

/* 输入区域包装器 */
.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  max-width: 900px;
  margin: 0 auto;
}

/* 输入框 */
.input-field {
  flex: 1;
  min-width: 0;
}

:deep(.var-input__textarea) {
  border-radius: 12px;
  background: var(--color-surface);
  padding: 12px 16px;
  font-size: 15px;
  line-height: 1.5;
  resize: none;
  border: 1px solid var(--color-border);
  transition: border-color 0.3s, box-shadow 0.2s ease-in-out;
}

:deep(.var-input__textarea:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

/* 按钮组 */
.button-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 按钮基础样式 - 防止被拉伸 */
.action-btn {
  flex-shrink: 0;
  height: 40px !important;
  min-height: 40px !important;
  max-height: 40px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  white-space: nowrap;
}

/* 图标按钮 */
.icon-btn {
  width: 40px !important;
  min-width: 40px !important;
  max-width: 40px !important;
  padding: 0 !important;
}

/* 发送/停止按钮 */
.send-btn {
  padding: 0 16px !important;
  min-width: auto !important;
}

.btn-text {
  margin-left: 4px;
  font-size: 14px;
  line-height: 1;
}

/* 字数统计 */
.char-count {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  padding: 0 4px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.char-count span {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* 响应式 */
@media (max-width: 640px) {
  .input-box-container {
    padding: 10px 12px;
  }

  .btn-text {
    display: none;
  }

  .send-btn {
    width: 40px !important;
    min-width: 40px !important;
    padding: 0 !important;
  }
}

/* 强制覆盖 Varlet UI 的默认样式 */
:deep(.var-button) {
  flex-shrink: 0 !important;
}

:deep(.var-button__content) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
}
</style>
