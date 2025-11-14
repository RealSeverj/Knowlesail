<script setup>
import { computed } from 'vue'
import { useTodoStore } from '@/stores/todo'

const props = defineProps({
	todo: {
		type: Object,
		required: true
	}
})

const todoStore = useTodoStore()

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
</script>

<template>
	<div
		class="flex items-start gap-3 rounded-xl bg-[var(--color-body)]/70 px-3 py-2 text-xs"
	>
		<button
			class="mt-1 flex h-4 w-4 items-center justify-center rounded-full border border-[var(--color-border)] bg-white"
			:class="props.todo.completed ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : ''"
			@click.stop="handleToggle"
		>
			<var-icon
				v-if="props.todo.completed"
				name="check"
				:size="12"
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
				<span
					class="shrink-0 rounded-full bg-[var(--color-surface)] px-2 py-0.5 text-[10px] text-[var(--color-text-secondary)]"
				>
					{{ props.todo.category || '默认' }}
				</span>
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
	</div>
</template>

<style scoped>
.line-clamp-2 {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>
