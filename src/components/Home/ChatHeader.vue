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
			class="chat-header flex items-center justify-between px-4 pb-2 pt-4"
		>
		<div class="flex min-w-0 items-center gap-3">
					<button
						type="button"
						class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full shadow"
						@click="handleNavigateHistory"
					>
			<var-icon name="menu" :size="24" />
            <span class="sr-only">查看聊天历史</span>
          </button>
        
          <div class="flex min-w-0 flex-col">
			<span class="truncate text-lg font-semibold text-[var(--color-text-primary)]">
              {{ title }}
            </span>
			<span class="mt-1 truncate text-xs text-[var(--color-text-secondary)]">
              {{ subtitle }}
            </span>
          </div>
        </div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				class="flex h-9 w-9 items-center justify-center rounded-full shadow"
				@click="handleNewChat"
			>
				<var-icon name="plus" :size="24" />
				<span class="sr-only">新聊天</span>
			</button>
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

:deep(.var-button__content) {
	display: inline-flex;
	align-items: center;
	justify-content: center;
}
</style>
