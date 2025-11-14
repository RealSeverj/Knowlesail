<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/Layout/AppHeader.vue'
import { useChatStore } from '@/stores/chat'
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const chatStore = useChatStore()
const { confirm } = useConfirm()
const toast = useToast()

const conversations = computed(() => chatStore.conversations || [])

const handleBack = () => {
	router.push({ name: 'Home' })
}

const handleSelect = (conversationId) => {
	chatStore.switchConversation(conversationId)
	router.push({ name: 'Home' })
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

const handleClearAll = async () => {
	if (conversations.value.length === 0) return
	const confirmed = await confirm('是否清空所有历史会话？该操作不可撤销。', {
		title: '清空确认'
	})
	if (!confirmed) return
	chatStore.clearAllConversations()
	toast.success('已清空所有历史会话')
}

const getPreview = (conversation) => {
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
	<section class="history-page flex h-full flex-col bg-[var(--color-body)] pb-10">
		<AppHeader
			title="历史会话"
			subtitle="管理和切换聊天记录"
			show-back
			:auto-back="false"
			@back="handleBack"
		/>

		<div class="flex-1 overflow-y-auto px-4 pb-6">
			<div
				v-if="conversations.length === 0"
				class="flex h-full flex-col items-center justify-center gap-4 text-center text-[var(--color-text-secondary)]"
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
						@click="handleSelect(conversation.id)"
					>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<span class="truncate text-base font-semibold text-[var(--color-text-primary)]">
									{{ conversation.title || '未命名对话' }}
								</span>
								<span
									v-if="conversation.id === chatStore.currentConversationId"
									class="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs text-[var(--color-primary)]"
								>
									当前
								</span>
							</div>
							<p class="mt-1 truncate text-sm text-[var(--color-text-secondary)]">
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

		<button
			v-if="conversations.length > 0"
			type="button"
			class="fab"
			@click="handleClearAll"
		>
			<var-icon name="delete" :size="22" />
			<span class="sr-only">清空全部历史会话</span>
		</button>
	</section>
</template>

<style scoped>
.history-page {
	position: relative;
}

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
