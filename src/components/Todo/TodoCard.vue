<script setup>
import TodoItem from './TodoItem.vue'

const props = defineProps({
	quadrant: {
		type: Object,
		required: true
	},
	todos: {
		type: Array,
		default: () => []
	},
	active: {
		type: Boolean,
		default: false
	},
	compact: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['click'])

const handleClick = () => {
	emit('click')
}
</script>

<template>
	<div
		class="todo-card group flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-md transition-all duration-300"
		:class="[
			active
				? 'h-full p-3'
				: compact
					? 'w-36 p-2 opacity-95 hover:opacity-100'
					: 'p-3',
			compact && !active ? 'backdrop-blur-md/40' : '',
		]
		"
		@click="handleClick"
	>
		<header
			class="relative flex items-center justify-between rounded-xl bg-gradient-to-r px-3 py-2 text-xs text-white"
			:class="quadrant.color"
		>
			<div class="flex flex-col">
				<span class="font-semibold">{{ quadrant.title }}</span>
				<span class="mt-0.5 text-[10px] opacity-90">
					{{ todos.length ? `共 ${todos.length} 项` : '暂无待办' }}
				</span>
			</div>
		</header>

		<div
			v-if="active"
			class="mt-2 flex-1 space-y-2 overflow-y-auto pb-2"
		>
			<TodoItem
				v-for="todo in todos"
				:key="todo.id"
				:todo="todo"
			/>
			<p
				v-if="!todos.length"
				class="py-6 text-center text-xs text-[var(--color-text-secondary)]"
			>
				这个象限还没有任务，去添加一个吧
			</p>
		</div>
	</div>
</template>

<style scoped>
.todo-card::-webkit-scrollbar {
	width: 4px;
}
.todo-card::-webkit-scrollbar-thumb {
	background-color: rgba(0, 0, 0, 0.15);
	border-radius: 999px;
}
</style>
