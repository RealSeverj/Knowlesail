<template>
  <div class="chat-interface">
    <!-- 消息列表区域 -->
    <div ref="messagesContainer" class="messages-container">
      <!-- 空状态 -->
      <div v-if="messages.length === 0" class="empty-state">
        <div class="empty-icon">
          <var-icon name="chat-outline" :size="64" />
        </div>
        <h3 class="empty-title">开始新对话</h3>
        <p class="empty-description">向 AI 助手提问，获取智能回答</p>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <var-button
            v-for="action in quickActions"
            :key="action.text"
            class="quick-action-btn"
            @click="handleQuickAction(action.text)"
          >
            <var-icon :name="action.icon" />
            <span>{{ action.text }}</span>
          </var-button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-else class="messages-list">
        <MessageItem
          v-for="message in messages"
          :key="message.id"
          :message="message"
          @export="handleExportMessage"
        />

        <!-- 加载占位 -->
        <div v-if="isLoading" class="loading-placeholder">
          <var-loading type="wave" :size="24" />
          <span class="ml-2">AI 正在思考...</span>
        </div>
      </div>
    </div>

    <!-- 输入框 -->
    <InputBox />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import MessageItem from './MessageItem.vue'
import InputBox from './InputBox.vue'
import { throttle } from '@/utils/common'

const chatStore = useChatStore()

const messagesContainer = ref(null)

const messages = computed(() => chatStore.currentMessages)
const isLoading = computed(() => chatStore.isStreaming)

// 快捷操作
const quickActions = [
  { icon: 'help-circle-outline', text: '解释一个概念' },
  { icon: 'code-tags', text: '帮我写代码' },
  { icon: 'translate', text: '翻译文本' },
  { icon: 'lightbulb-outline', text: '给我一些建议' }
]

// 处理快捷操作
function handleQuickAction(text) {
  chatStore.sendMessage(text)
}

// 处理导出消息到知识库
function handleExportMessage(message) {
  console.log('导出消息到知识库:', message)
  // TODO: 实现导出功能
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动
watch(
  () => messages.value.length,
  () => {
    scrollToBottom()
  }
)

// 监听最后一条消息内容变化（流式输出）
watch(
  () => messages.value[messages.value.length - 1]?.content,
  throttle(()=>{
    nextTick(()=>{
      scrollToBottom()
    })
  })
)

// 初始化
onMounted(() => {
  chatStore.loadConversations()
  nextTick(()=>{
    scrollToBottom()
  })
})
</script>

<style scoped>
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-body);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;
}

/* 自定义滚动条 */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 24px;
  color: var(--color-primary);
  opacity: 0.6;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-width: 400px;
  width: 100%;
}

.quick-action-btn {
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 80px;
}

.quick-action-btn:hover {
  border-color: var(--color-primary);
  background: rgba(26, 115, 232, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-action-btn span {
  font-size: 14px;
  color: var(--color-text-primary);
  text-align: center;
}

/* 消息列表 */
.messages-list {
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

/* 加载占位 */
.loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 640px) {
  .messages-container {
    padding: 12px;
  }

  .empty-state {
    padding: 20px;
  }

  .empty-title {
    font-size: 20px;
  }

  .quick-actions {
    grid-template-columns: 1fr;
    max-width: 300px;
  }

  .quick-action-btn {
    min-height: 60px;
    padding: 12px;
  }
}
</style>
