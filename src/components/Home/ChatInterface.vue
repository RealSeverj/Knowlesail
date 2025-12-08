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
const bottomThreshold = 4
// 固定底部留白，预留输入框展开后的空间，避免内容跳动
const FIXED_BOTTOM_PADDING = 180
const lastScrollTop = ref(0)

const messages = computed(() => chatStore.currentMessages || [])
const isStreaming = computed(() => chatStore.isStreaming)
const hasMessages = computed(() => messages.value.length > 0)
const lastMessageContent = computed(() => messages.value[messages.value.length - 1]?.content || '')

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

const handleViewportClick = (event) => {
  const element = event.target instanceof Element ? event.target : null
  if (
    element &&
    element.closest(
      'button, a, input, textarea, [role="button"], .var-button, .var-input, [data-prevent-input-trigger]'
    )
  ) {
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
  <section class="flex flex-col min-h-0 flex-1 overflow-x-hidden">
    <div
      ref="viewportRef"
      class="overflow-y-auto min-h-0 flex-1 px-2 py-6 chat-viewport"
      @scroll="handleScroll"
      @click="handleViewportClick"
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
}
</style>
