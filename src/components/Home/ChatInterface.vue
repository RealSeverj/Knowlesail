<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import MessageItem from './MessageItem.vue'
import QuickActions from './QuickActions.vue'
import { throttle } from '@/utils/common'

const chatStore = useChatStore()
const emit = defineEmits(['bottom-state-change', 'request-input-expand', 'leave-bottom-by-scroll'])

const viewportRef = ref(null)
const isNearBottom = ref(true)
const bottomThreshold = 56 + 4 // 预留底部导航栏
const lastScrollTop = ref(0)

const messages = computed(() => chatStore.currentMessages || [])
const isStreaming = computed(() => chatStore.isStreaming)
const hasMessages = computed(() => messages.value.length > 0)
const lastMessageContent = computed(() => messages.value[messages.value.length - 1]?.content || '')

const autoScrollEnabled = ref(true)
const isProgrammaticScroll = ref(false)
let autoScrollTimer = null
let programmaticScrollTimer = null

const updateBottomState = (checkExpand = true) => {
  const el = viewportRef.value
  if (!el) return

  const remaining = el.scrollHeight - el.scrollTop - el.clientHeight
  const atBottom = remaining <= bottomThreshold

  if (atBottom !== isNearBottom.value) {
    isNearBottom.value = atBottom
    emit('bottom-state-change', { atBottom, checkExpand })
  }
}

const scrollToBottom = () => {
  if (!autoScrollEnabled.value) return
  nextTick(() => {
    const el = viewportRef.value
    if (el) {
      isProgrammaticScroll.value = true
      el.scrollTop = el.scrollHeight
      if (programmaticScrollTimer) clearTimeout(programmaticScrollTimer)
      programmaticScrollTimer = setTimeout(() => {
        isProgrammaticScroll.value = false
        programmaticScrollTimer = null
      }, 300)
    }
  })
}

const handleScroll = (event) => {
  const el = viewportRef.value
  if (!el) return

  const current = el.scrollTop
  const direction = current < lastScrollTop.value ? 'up' : 'down'
  lastScrollTop.value = current

  const checkExpand = event?.isTrusted && !isProgrammaticScroll.value
  updateBottomState(checkExpand)

  if (direction === 'up' && !isNearBottom.value) {
    emit('leave-bottom-by-scroll')
  }

  // 用户主动滑动时禁用自动滚动，2秒后恢复
  autoScrollEnabled.value = false
  if (autoScrollTimer) clearTimeout(autoScrollTimer)
  autoScrollTimer = setTimeout(() => {
    autoScrollEnabled.value = true
    // 若滑动结束后已到底部，立即滚动到底
    if (isNearBottom.value) scrollToBottom()
  }, 2000)
}

const handleQuickAction = (action) => {
  chatStore.sendMessage(action.preset || action.title)
}

watch(
  () => lastMessageContent.value,
  throttle(() => {
    scrollToBottom()
  }, 80)
)

// 监听流式传输状态变化，确保结束时滚动到底部
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
})
</script>

<template>
  <section class="flex flex-col min-h-0 flex-1 overflow-x-hidden">
    <div
      ref="viewportRef"
      class="overflow-y-auto min-h-0 flex-1 px-2 py-6 chat-viewport"
      @scroll="handleScroll"
    >
      <div v-if="hasMessages" class="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <MessageItem v-for="message in messages" :key="message.id" :message="message" />
      </div>

      <div v-else class="flex h-full flex-col">
        <QuickActions class="flex-1" @select="handleQuickAction" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.chat-viewport {
  /* 固定底部留白，预留输入框展开后的空间 */
  padding-bottom: 180px;
  scroll-behavior: smooth;
}
</style>
