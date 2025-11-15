<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
	show: {
		type: Boolean,
		default: false
	},
	todos: {
		type: Array,
		default: () => []
	}
})

const emit = defineEmits(['update:show', 'close'])

const keyword = ref('')
const category = ref('全部')

const isOpen = computed({
	get() {
		return props.show
	},
	set(v) {
		emit('update:show', v)
	}
})

const categories = computed(() => {
	const set = new Set()
	props.todos.forEach((t) => {
		if (t.category) set.add(t.category)
	})
	return ['全部', ...Array.from(set)]
})

const filtered = computed(() => {
	const kw = keyword.value.trim().toLowerCase()
	return props.todos.filter((t) => {
		if (category.value !== '全部' && t.category !== category.value) return false
		if (!kw) return true
		return (
			(t.title && t.title.toLowerCase().includes(kw)) ||
			(t.note && t.note.toLowerCase().includes(kw))
		)
	})
})

watch(
	() => props.show,
	(val) => {
		if (!val) {
			keyword.value = ''
			category.value = '全部'
		}
	}
)

const handleClose = () => {
	isOpen.value = false
	emit('close')
}
</script>

<template>
	<var-popup
		v-model:show="isOpen"
		position="bottom"
		safe-area
		:overlay="true"
		:close-on-click-overlay="true"
		@click-overlay="handleClose"
	>
		<div class="max-h-[70vh] rounded-t-3xl bg-[var(--color-surface)] px-4 pb-6 pt-4">
			<header class="mb-3 flex items-center justify-between">
				<h2 class="text-base font-semibold text-[var(--color-text-primary)]">搜索待办</h2>
				<button
					class="p-1 text-[var(--color-text-secondary)]"
					@click="handleClose"
				>
					<var-icon name="close" :size="18" />
				</button>
			</header>

			<div class="space-y-3 text-sm">
				<var-input
					v-model="keyword"
					placeholder="输入关键词搜索，支持名称和备注"
					clearable
					prepend-icon="magnify"
				/>

				<div>
					<p class="mb-1 text-xs text-[var(--color-text-secondary)]">按类别筛选</p>
					<div class="flex flex-wrap gap-2">
						<button
							v-for="c in categories"
							:key="c"
							class="rounded-full border px-3 py-1 text-xs"
							:class="
								c === category
									? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
									: 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
							"
							@click="category = c"
						>
							{{ c }}
						</button>
					</div>
				</div>

				<div class="max-h-[40vh] overflow-y-auto">
					<p
						v-if="!filtered.length"
						class="py-8 text-center text-xs text-[var(--color-text-secondary)]"
					>
						未找到匹配的待办
					</p>
					<ul v-else class="space-y-2">
						<li
							v-for="t in filtered"
							:key="t.id"
							class="rounded-xl bg-[var(--color-body)]/70 px-3 py-2 text-xs"
						>
							<p class="text-[13px] font-medium text-[var(--color-text-primary)]">
								{{ t.title }}
							</p>
							<p
								v-if="t.note"
								class="mt-1 line-clamp-2 text-[11px] text-[var(--color-text-secondary)]"
							>
								{{ t.note }}
							</p>
							<p class="mt-1 text-[10px] text-[var(--color-text-secondary)]">
								{{ t.category || '默认' }}
							</p>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</var-popup>
</template>

<style scoped>
.line-clamp-2 {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>
