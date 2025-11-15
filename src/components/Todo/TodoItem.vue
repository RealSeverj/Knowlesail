<script setup>
import { computed, ref } from 'vue'
import { useTodoStore } from '@/stores/todo'
import { useConfirm } from '@/composables/useConfirm'

const props = defineProps({
	todo: {
		type: Object,
		required: true
	}
})

const todoStore = useTodoStore()
const showActions = ref(false)
const emit = defineEmits(['edit'])
const { confirm } = useConfirm()

const isOverdue = computed(() => {
	if (!props.todo.deadline) return false
	const d = new Date(props.todo.deadline)
	if (Number.isNaN(d.getTime())) return false
	return !props.todo.completed && d.getTime() < Date.now()
})

const deadlineText = computed(() => {
	if (!props.todo.deadline) return '无截止时间'
	const d = new Date(props.todo.deadline)
	if (Number.isNaN(d.getTime())) return '无效的时间'
	return d.toLocaleString()
})

const handleToggle = () => {
	todoStore.toggleTodo(props.todo.id)
}

const handleDelete = async () => {
	const ok = await confirm(`确认删除「${props.todo.title}」吗？`, {
		title: '删除待办',
		confirmText: '删除',
		cancelText: '取消'
	})
	if (!ok) return
	todoStore.removeTodo(props.todo.id)
	showActions.value = false
}

const handleEdit = () => {
	emit('edit', props.todo)
	showActions.value = false
}

const toggleActions = () => {
	showActions.value = !showActions.value
}
</script>

<template>
	<div
		class="relative flex items-start gap-3 rounded-xl bg-[var(--color-body)]/70 px-3 py-2 text-xs"
	>
		<button
			class="mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--color-border)] bg-white transition-colors duration-150"
			:class="props.todo.completed ? 'bg-[var(--color-primary)] border-[var(--color-primary)] shadow-sm' : 'hover:border-[var(--color-primary)]'"
			@click.stop="handleToggle"
		>
			<var-icon
				v-if="props.todo.completed"
				name="check"
				:size="14"
				color="#fff"
			/>
		</button>

		<div class="flex-1">
			<div class="flex items-center justify-between gap-2">
				<p
					class="text-[13px] font-medium text-[var(--color-text-primary)]"
					:class="props.todo.completed ? 'line-through opacity-60' : ''"
				>
					{{ props.todo.title }}
				</p>
				<div class="flex items-center gap-1">
					<span
						class="shrink-0 rounded-full bg-[var(--color-surface)] px-2 py-0.5 text-[10px] text-[var(--color-text-secondary)]"
					>
						{{ props.todo.category || '默认' }}
					</span>
					<button
						class="flex h-5 w-5 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]"
						@click.stop="toggleActions"
					>
						<var-icon name="dots-vertical" :size="14" />
					</button>
				</div>
			</div>
			<p
				v-if="props.todo.note"
				class="mt-1 line-clamp-2 text-[11px] text-[var(--color-text-secondary)]"
			>
				{{ props.todo.note }}
			</p>
			<p
				class="mt-1 text-[10px]"
				:class="isOverdue ? 'text-red-500' : 'text-[var(--color-text-secondary)]'"
			>
				截止：{{ deadlineText }}
			</p>
		</div>

		<!-- 操作菜单：全屏遮罩 + 放大按钮区域，适配移动端 -->
		<!-- 点击遮罩关闭菜单 -->
		<div
			v-if="showActions"
			class="fixed inset-0 z-10"
			@click="showActions = false"
		/>
		<div
			v-if="showActions"
			class="absolute right-2 top-8 z-20 w-40 rounded-xl bg-[var(--color-surface)] p-2 text-[12px] shadow-lg"
		>
			<button
				class="flex w-full items-center justify-between rounded-lg px-2 py-2 active:bg-[var(--color-body)]/90"
				@click.stop="handleEdit"
			>
				<span>编辑</span>
				<var-icon name="pencil" :size="16" />
			</button>
			<button
				class="mt-1 flex w-full items-center justify-between rounded-lg px-2 py-2 text-red-500 active:bg-red-50"
				@click.stop="handleDelete"
			>
				<span>删除</span>
				<var-icon name="delete" :size="16" />
			</button>
		</div>
	</div>
</template>

<style scoped>
.line-clamp-2 {
	display: -webkit-box;
	line-clamp: 2;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>
