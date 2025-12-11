<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import ExportToKnowledge from '@/components/Home/ExportToKnowledge.vue'

const router = useRouter()
const chatStore = useChatStore()

const selectedMessageIds = ref([])

const title = computed(() => {
  const fallback = '新对话'
  const value = chatStore.currentConversation?.title
  return value?.trim() ? value : fallback
})

const subtitle = computed(() => {
  const conv = chatStore.currentConversation
  if (!conv?.updatedAt) return '随时记录灵感'
  const date = new Date(conv.updatedAt)
  return date.toLocaleString()
})

// 是否为云端同步的会话
const isCloudSync = computed(() => {
  return chatStore.currentConversation?.isCloudSync === true
})

const handleNavigateHistory = () => {
  router.push({ name: 'ChatHistory' })
}

const handleNewChat = () => {
  chatStore.createConversation()
}
</script>

<template>
  <header class="chat-header flex flex-col gap-2 px-4 pb-2 pt-4">
    <!-- 第一行：标题 + 云端同步（右侧） -->
    <div class="flex items-center justify-between min-w-0 gap-3">
      <span class="text-xl font-semibold text-[var(--color-text-primary)] truncate">
        {{ title }}
      </span>
      <span
        v-if="isCloudSync"
        class="cloud-sync-badge inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shrink-0"
      >
        <var-icon name="cloud-outline" :size="12" />
        云端同步
      </span>
    </div>

    <!-- 第二行：左侧时间，右侧操作按钮 -->
    <div
      class="flex items-center justify-between min-w-0 gap-3 text-xs text-[var(--color-text-secondary)]"
    >
      <span class="truncate">{{ subtitle }}</span>
      <div class="flex items-center gap-2">
        <ExportToKnowledge />
        <button type="button" class="icon-circle-btn" @click="handleNewChat">
          <var-icon name="plus" :size="24" />
          <span class="sr-only">新聊天</span>
        </button>
        <button type="button" class="icon-circle-btn" @click="handleNavigateHistory">
          <var-icon name="menu" :size="24" />
          <span class="sr-only">查看聊天历史</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
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
