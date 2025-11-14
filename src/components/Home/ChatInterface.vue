<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import MessageItem from './MessageItem.vue'
import QuickActions from './QuickActions.vue'
import { throttle } from '@/utils/common'

const props = defineProps({
  bottomOffset: {
    type: Number,
    default: 0
  }
})

const chatStore = useChatStore()
const emit = defineEmits(['bottom-state-change', 'request-input-expand', 'leave-bottom-by-scroll'])

const viewportRef = ref(null)
const isNearBottom = ref(true)
const bottomThreshold = 4
const BASE_BOTTOM_PADDING = 24
const lastScrollTop = ref(0)

const messages = computed(() => chatStore.currentMessages || [])
const isStreaming = computed(() => chatStore.isStreaming)
const hasMessages = computed(() => messages.value.length > 0)
const lastMessageContent = computed(() => messages.value[messages.value.length - 1]?.content || '')
const viewportStyle = computed(() => ({
  paddingBottom: `${BASE_BOTTOM_PADDING + props.bottomOffset}px`
}))

const updateBottomState = () => {
  const el = viewportRef.value
  if (!el) return

  const remaining = el.scrollHeight - el.scrollTop - el.clientHeight
  const atBottom = remaining <= bottomThreshold

  if (atBottom !== isNearBottom.value) {
    isNearBottom.value = atBottom
    emit('bottom-state-change', atBottom)
  }
}

const scrollToBottom = (opts = { animated: true }) => {
  nextTick(() => {
    const el = viewportRef.value
    if (el) {
      if (opts.animated) {
        el.scrollTop = el.scrollHeight
      } else {
        el.scrollTop = el.scrollHeight
      }
    }
  })
}

const handleScroll = () => {
  const el = viewportRef.value
  if (!el) return

  const current = el.scrollTop
  const direction = current < lastScrollTop.value ? 'up' : 'down'
  lastScrollTop.value = current

  updateBottomState()

  if (direction === 'up' && !isNearBottom.value) {
    emit('leave-bottom-by-scroll')
  }
}

const handleQuickAction = (action) => {
  chatStore.sendMessage(action.preset || action.title)
}

const handleExportMessage = (message) => {
  // 预留导出能力，当前仅做占位日志
  console.debug('导出消息到知识库占位：', message)
}

const handleViewportClick = (event) => {
  const element = event.target instanceof Element ? event.target : null
  if (element && element.closest('button, a, input, textarea, [role="button"], .var-button, .var-input, [data-prevent-input-trigger]')) {
    return
  }
  emit('request-input-expand')
}

watch(
  () => messages.value.length,
  () => {
    scrollToBottom()
  }
)

watch(
  () => lastMessageContent.value,
  throttle(() => {
    scrollToBottom()
  }, 80)
)

watch(isStreaming, (active) => {
  if (!active) {
    scrollToBottom()
  }
})

onMounted(async () => {
  if (!chatStore.currentConversationId) {
    await chatStore.loadConversations()
  }
  scrollToBottom()
  nextTick(() => {
    updateBottomState()
    emit('bottom-state-change', isNearBottom.value)
  })
})
</script>

<template>
  <section class="chat-interface flex h-full flex-col bg-[var(--color-body)]">
    <div
      ref="viewportRef"
      class="message-viewport flex-1 overflow-y-auto px-4 py-6"
      :style="viewportStyle"
      @scroll="handleScroll"
      @click="handleViewportClick"
    >
      <div
        v-if="hasMessages"
        class="mx-auto flex w-full max-w-3xl flex-col gap-4"
      >
        <MessageItem
          v-for="message in messages"
          :key="message.id"
          :message="message"
          @export="handleExportMessage"
        />

        <div
          v-if="isStreaming"
          class="flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"
        >
          <var-loading type="cube" :size="20" />
          <span>AI 正在思考...</span>
        </div>
      </div>

      <div
        v-else
        class="flex h-full flex-col items-center justify-center gap-6 px-6 text-center"
      >
        <div class="rounded-full bg-[var(--color-surface)] p-6 text-[var(--color-primary)]">
          <var-icon name="chat-outline" :size="56" />
        </div>
        <div class="space-y-2">
          <h3 class="text-xl font-semibold text-[var(--color-text-primary)]">开始新对话</h3>
          <p class="text-sm text-[var(--color-text-secondary)]">向 AI 提问或选择快捷操作开启灵感流</p>
        </div>

        <QuickActions @select="handleQuickAction" />
      </div>
    </div>

  </section>
</template>

<style scoped>
.message-viewport {
  scroll-behavior: smooth;
}

.message-viewport::-webkit-scrollbar {
  width: 6px;
}

.message-viewport::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.message-viewport::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.32);
}

@media (max-width: 640px) {
  .message-viewport {
    padding: 16px 12px 20px;
  }
}
</style>
