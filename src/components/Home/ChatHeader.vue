<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'

const router = useRouter()
const chatStore = useChatStore()

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

const handleNavigateHistory = () => {
	router.push({ name: 'ChatHistory' })
}

const handleNewChat = () => {
	chatStore.createConversation()
}
</script>

<template>
	<header
      class="chat-header flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-body)] px-4 py-3"
    >
		<div class="flex min-w-0 items-center gap-3">
          <button
            type="button"
            class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm"
            @click="handleNavigateHistory"
          >
            <var-icon name="menu" :size="20" />
            <span class="sr-only">查看聊天历史</span>
          </button>
        
          <div class="flex min-w-0 flex-col">
            <span class="truncate text-base font-semibold text-[var(--color-text-primary)]">
              {{ title }}
            </span>
            <span class="truncate text-xs text-[var(--color-text-secondary)]">
              {{ subtitle }}
            </span>
          </div>
        </div>

		<button
			type="button"
			class="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-sm"
			@click="handleNewChat"
		>
			<var-icon name="plus" :size="20" />
			<span class="sr-only">新聊天</span>
		</button>
	</header>
</template>

<style scoped>
.chat-header {
	position: sticky;
	top: 0;
	z-index: 20;
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

:deep(.var-button__content) {
	display: inline-flex;
	align-items: center;
	justify-content: center;
}
</style>
