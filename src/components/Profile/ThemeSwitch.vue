<script setup>
import { computed, onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { theme, initTheme, setTheme } = useTheme()

const options = [
	{ label: '浅色', value: 'light', icon: 'white-balance-sunny' },
	{ label: '深色', value: 'dark', icon: 'weather-night' }
]

const currentLabel = computed(() => {
	const found = options.find((o) => o.value === theme.value)
	return found ? found.label : '浅色'
})

const handleChange = (value) => {
	setTheme(value)
}

onMounted(() => {
	initTheme()
})
</script>

<template>
	<div class="flex items-center justify-between px-3 py-2">
		<div class="flex flex-col">
			<p class="text-sm font-medium text-slate-800 dark:text-slate-100">界面主题</p>
			<p class="text-xs text-slate-500 dark:text-slate-400">当前：{{ currentLabel }}</p>
		</div>
		<var-select
			class="min-w-[112px]"
			variant="outlined"
			:line="false"
			:clearable="false"
			:hint="false"
			:options="options"
			:model-value="theme"
			@update:model-value="handleChange"
		>
		</var-select>
	</div>
</template>

<style scoped></style>
