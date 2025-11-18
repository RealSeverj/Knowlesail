<script setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { theme, updateCustomTheme } = useTheme()

const isCustom = computed(() => theme.value?.id === 'custom')

const primary = computed({
  get: () => theme.value?.colors?.['--color-primary'] || '#3b82f6',
  set: (val) => {
    updateCustomTheme({ colors: { '--color-primary': val } })
  }
})

const background = computed({
  get: () => theme.value?.colors?.['--color-background'] || '#ffffff',
  set: (val) => {
    updateCustomTheme({ colors: { '--color-background': val } })
  }
})

const bgImage = computed({
  get: () => theme.value?.backgroundImage || '',
  set: (val) => {
    updateCustomTheme({ backgroundImage: val })
  }
})

const bgOpacity = computed({
	get: () =>
		typeof theme.value?.bgOpacity !== 'undefined' ? String(theme.value.bgOpacity) : '1',
	set: (val) => {
		const num = Number(val)
		const clamped = Number.isNaN(num) ? 1 : Math.min(1, Math.max(0, num))
		updateCustomTheme({ bgOpacity: clamped })
	}
})

const bgBlur = computed({
	get: () => theme.value?.bgBlur || '0px',
	set: (val) => {
		// 简单兜底：为空则重置为 0px
		const safe = val && String(val).trim().length > 0 ? String(val) : '0px'
		updateCustomTheme({ bgBlur: safe })
	}
})
</script>

<template>
	<div class="p-4 space-y-4 text-xs">
		<div class="space-y-2">
			<label class="block text-slate-500 dark:text-slate-400">主色</label>
			<div class="flex items-center gap-3">
				<input
					type="color"
					v-model="primary"
					class="h-8 w-12 rounded border border-slate-300 dark:border-slate-600"
				/>
				<input
					type="text"
					v-model="primary"
					class="flex-1 rounded border px-2 py-1 text-xs border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60"
					placeholder="#3b82f6"
				/>
			</div>
		</div>

		<div class="space-y-2">
			<label class="block text-slate-500 dark:text-slate-400">背景色</label>
			<div class="flex items-center gap-3">
				<input
					type="color"
					v-model="background"
					class="h-8 w-12 rounded border border-slate-300 dark:border-slate-600"
				/>
				<input
					type="text"
					v-model="background"
					class="flex-1 rounded border px-2 py-1 text-xs border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60"
					placeholder="#ffffff"
				/>
			</div>
		</div>

		<div class="space-y-2">
			<label class="block text-slate-500 dark:text-slate-400">背景图片 URL（可选）</label>
			<input
					type="text"
					v-model="bgImage"
					class="w-full rounded border px-2 py-1 text-xs border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60"
					placeholder="如 https://xxx/xxx.jpg，不填则使用纯色背景"
				/>
			<p class="text-[11px] text-slate-400 dark:text-slate-500">
				建议使用尺寸较大的图片（如 1920x1080），以保证不同设备下效果。
			</p>
		</div>

		<div class="space-y-2">
			<label class="block text-slate-500 dark:text-slate-400">背景图透明度（0-1）</label>
			<div class="flex items-center gap-3">
				<input
						type="range"
						min="0"
						max="1"
						step="0.05"
						v-model="bgOpacity"
						class="flex-1"
					/>
				<input
						type="number"
						min="0"
						max="1"
						step="0.05"
						v-model="bgOpacity"
						class="w-16 rounded border px-2 py-1 text-xs border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-right"
					/>
			</div>
		</div>

		<div class="space-y-2">
			<label class="block text-slate-500 dark:text-slate-400">背景图模糊（px）</label>
			<div class="flex items-center gap-3">
				<input
						type="range"
						min="0"
						max="30"
						step="1"
						:value="parseInt(bgBlur, 10) || 0"
						@input="(e) => (bgBlur = `${e.target.value}px`)"
						class="flex-1"
					/>
				<input
						type="number"
						min="0"
						max="30"
						step="1"
						:value="parseInt(bgBlur, 10) || 0"
						@input="(e) => (bgBlur = `${e.target.value || 0}px`)"
						class="w-16 rounded border px-2 py-1 text-xs border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-right"
					/>
			</div>
		</div>

		<p v-if="!isCustom" class="text-[11px] text-amber-500">
			当前不是“自定义主题”，调整后会自动切换到自定义主题。
		</p>
	</div>
</template>

<style scoped></style>
