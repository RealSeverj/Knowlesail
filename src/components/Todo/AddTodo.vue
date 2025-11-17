<script setup>
import { ref, computed, watch } from 'vue'
import { useTodoStore } from '@/stores/todo'
import DatePicker from '@/components/Todo/DatePicker.vue'

const props = defineProps({
	show: {
		type: Boolean,
		default: false
	},
	// 传入待编辑的 todo，不传则为新增模式
	editingTodo: {
		type: Object,
		default: null
	},
	// 默认象限（用于从象限双击创建待办）
	defaultQuadrant: {
		type: Number,
		default: null
	}
})

const emit = defineEmits(['update:show', 'close'])

const todoStore = useTodoStore()

const title = ref('')
const note = ref('')
const category = ref('')
const deadline = ref('')
const priority = ref(1)

const datePickerVisible = ref(false)

const deadlineDisplay = computed(() => {
	if (!deadline.value) return ''
	const d = new Date(deadline.value)
	if (Number.isNaN(d.getTime())) return ''
	return d.toLocaleString()
})

const categoryOptions = computed(() => {
	const set = new Set()
	todoStore.todos.forEach((t) => {
		if (t.category) set.add(t.category)
	})
	return Array.from(set)
})

const isEditMode = computed(() => !!props.editingTodo)

const isOpen = computed({
	get() {
		return props.show
	},
	set(v) {
		emit('update:show', v)
	}
})

const canSubmit = computed(() => title.value.trim().length > 0)

watch(
	() => props.show,
	(val) => {
		if (val) {
			// 打开时根据是否有 editingTodo 进行初始化
			if (props.editingTodo) {
				title.value = props.editingTodo.title || ''
				note.value = props.editingTodo.note || ''
				category.value = props.editingTodo.category || ''
				deadline.value = props.editingTodo.deadline || ''
				priority.value = props.editingTodo.priority || 1
			} else {
				reset()
				// 若从象限双击打开，预填对应优先象限
				if (props.defaultQuadrant) {
					priority.value = props.defaultQuadrant
				}
			}
			return
		}
		// 关闭时重置表单
		reset()
	}
)

const handleClose = () => {
	isOpen.value = false
	emit('close')
}

const handleSubmit = () => {
	if (!canSubmit.value) return

	const payload = {
		title: title.value.trim(),
		note: note.value.trim(),
		category: category.value.trim() || '默认',
		deadline: deadline.value || null,
		priority: Number(priority.value) || 1
	}

	if (isEditMode.value && props.editingTodo) {
		// 编辑模式：更新已有 todo
		todoStore.updateTodo(props.editingTodo.id, payload)
	} else {
		// 新增模式
		todoStore.addTodo(payload)
	}
	handleClose()
	reset()
}

const reset = () => {
	title.value = ''
	note.value = ''
	category.value = ''
	deadline.value = ''
	priority.value = 1
}

const openDatePicker = () => {
	datePickerVisible.value = true
}

const handleDatePickerClose = () => {
	datePickerVisible.value = false
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
		class="!bg-transparent"
	>
		<div class="max-h-[70vh] rounded-t-3xl bg-[var(--color-surface)] px-4 pb-6 pt-4">
			<header class="mb-3 flex items-center justify-between">
				<h2 class="text-base font-semibold text-[var(--color-text-primary)]">
					{{ isEditMode ? '编辑待办' : '添加待办' }}
				</h2>
				<button
					class="p-1 text-[var(--color-text-secondary)]"
					@click="handleClose"
				>
					<var-icon name="close" :size="18" />
				</button>
			</header>

			<div class="space-y-3 text-sm">
				<div>
					<label class="mb-1 block text-xs text-[var(--color-text-secondary)]">名称</label>
					<var-input
						v-model="title"
						placeholder="请输入待办名称"
						:maxlength="50"
						clearable
					/>
				</div>
				<div>
					<label class="mb-1 block text-xs text-[var(--color-text-secondary)]">备注</label>
					<var-input
						v-model="note"
						placeholder="补充说明（可选）"
						type="textarea"
						rows="3"
					/>
				</div>
				<div class="flex gap-3">
					<div class="flex-1">
						<label class="mb-1 block text-xs text-[var(--color-text-secondary)]">类别</label>
						<var-input
							v-model="category"
							placeholder="如 学习 / 工作"
							clearable
						/>
						<div
							v-if="categoryOptions.length"
							class="mt-2 flex flex-wrap gap-2"
						>
							<button
								v-for="item in categoryOptions"
								:key="item"
								type="button"
								class="rounded-full border px-3 py-1 text-[11px]"
								:class="
									item === category
										? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
										: 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
								"
								@click="category = item"
							>
								{{ item }}
							</button>
						</div>
					</div>
					<div class="flex-1">
						<label class="mb-1 block text-xs text-[var(--color-text-secondary)]">截止时间</label>
						<var-input
							:model-value="deadlineDisplay"
							placeholder="未设置（可选）"
							readonly
							@click="openDatePicker"
						>
							<template #append-icon>
								<var-icon
									name="calendar"
									:size="18"
									color="var(--color-text-secondary)"
								/>
							</template>
						</var-input>
					</div>
				</div>
				<div>
					<label class="mb-1 block text-xs text-[var(--color-text-secondary)]">优先象限</label>
					<var-select v-model="priority">
						<var-option :label="'紧急且重要 (一象限)'" :value="1" />
						<var-option :label="'重要不紧急 (二象限)'" :value="2" />
						<var-option :label="'紧急不重要 (三象限)'" :value="3" />
						<var-option :label="'不重要不紧急 (四象限)'" :value="4" />
					</var-select>
				</div>
			</div>

			<div class="mt-4 flex gap-3">
				<var-button
					block
					text
					@click="handleClose"
				>
					取消
				</var-button>
				<var-button
					block
					type="primary"
					:disabled="!canSubmit"
					@click="handleSubmit"
				>
					保存
				</var-button>
			</div>
		</div>

		<DatePicker
			v-model:show="datePickerVisible"
			v-model:model-value="deadline"
			@close="handleDatePickerClose"
		/>
	</var-popup>
</template>
