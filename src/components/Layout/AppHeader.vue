<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
	title: {
		type: String,
		default: ''
	},
	subtitle: {
		type: String,
		default: ''
	},
	showBack: {
		type: Boolean,
		default: false
	},
	backText: {
		type: String,
		default: ''
	},
	autoBack: {
		type: Boolean,
		default: true
	}
})

const emit = defineEmits(['back'])

const router = useRouter()

const handleBack = () => {
	emit('back')
	if (props.autoBack) {
		router.back()
	}
}
</script>

<template>
	<header class="app-header border-b border-[var(--color-border)] bg-[var(--color-body)] px-4 py-3">
		<div class="flex items-center gap-3">
			<button
				v-if="showBack"
				type="button"
				class="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm"
				@click="handleBack"
			>
				<var-icon name="chevron-left" :size="20" />
				<span class="sr-only">返回</span>
			</button>
			<div class="flex flex-col">
				<span class="text-base font-semibold text-[var(--color-text-primary)]">
					<slot name="title">{{ title }}</slot>
				</span>
				<span
					v-if="subtitle || $slots.subtitle"
					class="text-xs text-[var(--color-text-secondary)]"
				>
					<slot name="subtitle">{{ subtitle }}</slot>
				</span>
			</div>
		</div>

		<div class="ml-auto flex items-center gap-2">
			<slot name="right"></slot>
		</div>
	</header>
</template>

<style scoped>
.app-header {
	position: sticky;
	top: 0;
	z-index: 30;
    margin-bottom: 8px;
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
<!-- 顶部导航组件 -->
