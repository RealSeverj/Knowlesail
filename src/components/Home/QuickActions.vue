<script setup>
const emit = defineEmits(['select'])

const quickActions = Object.freeze([
	{
		icon: 'help-circle-outline',
		title: '解释一个概念',
		description: '快速梳理术语或定义',
		preset: '请帮我解释以下概念：'
	},
	{
		icon: 'code-tags',
		title: '帮我写代码',
		description: '提供示例或修复思路',
		preset: '请帮我写这段代码：'
	},
	{
		icon: 'translate',
		title: '翻译文本',
		description: '中英文互译快速完成',
		preset: '请翻译下面的文本：'
	},
	{
		icon: 'lightbulb-outline',
		title: '灵感建议',
		description: '让 AI 给你思路',
		preset: '我需要些灵感：'
	}
])

const handleClick = (action) => {
	emit('select', action)
}
</script>

<template>
	<div class="quick-actions grid w-full max-w-2xl gap-3 sm:grid-cols-2">
		<var-button
			v-for="action in quickActions"
			:key="action.title"
			type="default"
			class="quick-action-card flex flex-col items-start gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left"
			@click="handleClick(action)"
		>
			<div class="flex items-center gap-2 text-[var(--color-primary)]">
				<var-icon :name="action.icon" :size="20" />
				<span class="text-sm font-medium">{{ action.title }}</span>
			</div>
			<p class="text-xs text-[var(--color-text-secondary)]">{{ action.description }}</p>
		</var-button>
	</div>
</template>

<style scoped>
.quick-action-card {
	transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.quick-action-card:hover {
	border-color: var(--color-primary);
	box-shadow: 0 8px 20px rgba(26, 115, 232, 0.12);
	transform: translateY(-2px);
}
</style>
<!-- 快捷操作组件 -->
