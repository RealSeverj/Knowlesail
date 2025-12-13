<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/Layout/AppHeader.vue'
import PullRefresh from '@/components/Common/PullRefresh.vue'
import { useChatStore } from '@/stores/chat'
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'
import { useRouteScroll } from '@/composables/useRouteScroll'

const router = useRouter()
const chatStore = useChatStore()
const { confirm } = useConfirm()
const toast = useToast()

// 下拉刷新状态
const refreshing = ref(false)

// 容器元素，用于记录和恢复滚动位置
const containerRef = ref(null)

// 启用通用路由滚动记忆
// PullRefresh 组件内部才是真正的滚动容器，通过 getScrollElement 获取
const scrollElementRef = computed(() => {
  return containerRef.value?.getScrollElement?.() || containerRef.value
})

const { restore } = useRouteScroll(scrollElementRef)

// 下拉刷新：从云端拉取会话列表
async function onRefresh() {
  try {
    await chatStore.mergeCloudConversations()
    toast.success('会话列表已更新')
  } catch (error) {
    console.error('刷新会话列表失败:', error)
    toast.error('刷新失败，请稍后重试')
  } finally {
    refreshing.value = false
  }
}

const conversations = computed(() => chatStore.conversations || [])
const loadingConversationId = ref(null) // 正在加载的会话ID

// 页面加载时确保会话数据已从 localStorage 加载
onMounted(async () => {
  if (chatStore.conversations.length === 0) {
    await chatStore.loadConversations()
  }
  // 数据加载完成后，再次尝试恢复滚动位置
  setTimeout(() => restore(), 100)
})

const handleBack = () => {
  router.push({ name: 'Home' })
}

const handleSelect = async (conversationId) => {
  const conv = conversations.value.find((c) => c.id === conversationId)

  // 如果是需要加载的云端会话，显示加载状态
  if (conv?.isCloudSync && conv?.needsLoad) {
    loadingConversationId.value = conversationId
    try {
      await chatStore.switchConversation(conversationId)
    } catch (error) {
      toast.error('加载会话失败')
      loadingConversationId.value = null
      return
    }
    loadingConversationId.value = null
  } else {
    await chatStore.switchConversation(conversationId)
  }

  router.push({ name: 'Chat', params: { conversationId } })
}

const handleDelete = async (conversationId) => {
  const target = conversations.value.find((item) => item.id === conversationId)
  const title = target?.title || '该会话'
  const confirmed = await confirm(`确定要删除「${title}」吗？`, {
    title: '删除确认'
  })
  if (!confirmed) return
  chatStore.deleteConversation(conversationId)
  toast.success('会话已删除')
}

const getPreview = (conversation) => {
  // 云端会话且需要加载时，显示提示
  if (conversation?.isCloudSync && conversation?.needsLoad) {
    return '点击加载云端消息...'
  }
  if (!conversation?.messages?.length) return '暂无消息'
  const last = conversation.messages[conversation.messages.length - 1]
  return last.content.slice(0, 50) + (last.content.length > 50 ? '…' : '')
}

const formatTimestamp = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString()
}
</script>

<template>
  <div class="fixed inset-0 flex flex-col">
    <section class="flex h-full flex-col safe-area-top pb-14">
      <AppHeader
        title="历史会话"
        subtitle="管理和切换聊天记录"
        show-back
        :auto-back="false"
        @back="handleBack"
      />

      <div class="flex-1 overflow-hidden">
        <PullRefresh ref="containerRef" v-model="refreshing" @refresh="onRefresh">
          <div class="px-4 pb-6 min-h-full">
            <div
              v-if="conversations.length === 0"
              class="flex h-full flex-col items-center justify-center gap-4 text-center text-[var(--color-text-secondary)] pt-20"
            >
              <div class="rounded-full bg-[var(--color-surface)] p-6 text-[var(--color-primary)]">
                <var-icon name="comment-text-outline" :size="48" />
              </div>
              <div>
                <p class="text-base font-semibold text-[var(--color-text-primary)]">暂无历史会话</p>
                <p class="mt-1 text-sm">发起一次新聊天后会在此展示</p>
              </div>
            </div>

            <ul v-else class="space-y-3">
              <li v-for="conversation in conversations" :key="conversation.id">
                <button
                  type="button"
                  class="flex w-full items-center justify-between rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-left shadow-sm transition hover:shadow-md"
                  :class="{ 'opacity-60': loadingConversationId === conversation.id }"
                  :disabled="loadingConversationId === conversation.id"
                  @click="handleSelect(conversation.id)"
                >
                  <div class="flex-1 w-full overflow-hidden">
                    <div class="flex items-center gap-2">
                      <!-- 加载中显示 loading 图标 -->
                      <var-icon
                        v-if="loadingConversationId === conversation.id"
                        name="loading"
                        :size="16"
                        class="animate-spin text-[var(--color-primary)]"
                      />
                      <span
                        class="truncate text-base font-semibold text-[var(--color-text-primary)] min-w-[140px]"
                      >
                        {{ conversation.title || '未命名对话' }}
                      </span>
                      <span
                        v-if="conversation.isCloudSync"
                        class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shrink-0 ml-auto"
                      >
                        <var-icon name="cloud-outline" :size="10" />
                        云端
                      </span>
                      <span
                        v-if="conversation.id === chatStore.currentConversationId"
                        class="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs text-[var(--color-primary)] shrink-0"
                        :class="{ 'ml-auto': !conversation.isCloudSync }"
                      >
                        当前
                      </span>
                    </div>
                    <p
                      class="mt-1 truncate text-sm text-[var(--color-text-secondary)] whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      {{ getPreview(conversation) }}
                    </p>
                    <p class="mt-2 text-xs text-[var(--color-text-secondary)]">
                      更新于 {{ formatTimestamp(conversation.updatedAt) }}
                    </p>
                  </div>

                  <var-button
                    text
                    type="danger"
                    class="ml-3 shrink-0 text-sm"
                    @click.stop="handleDelete(conversation.id)"
                  >
                    <var-icon name="delete" :size="18" />
                  </var-button>
                </button>
              </li>
            </ul>
          </div>
        </PullRefresh>
      </div>
    </section>
  </div>
</template>

<style scoped>
.fab {
  position: fixed;
  bottom: calc(80px + env(safe-area-inset-bottom));
  right: 20px;
  height: 56px;
  width: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background-color: var(--color-primary);
  color: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
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
</style>
