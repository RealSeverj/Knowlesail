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

const normalizeBgImage = (val) => {
  const trimmed = (val || '').trim()
  if (!trimmed) return ''
  if (/^url\(/i.test(trimmed)) return trimmed
  // wrap plain URL/dataURL into url() for CSS background-image
  return `url("${trimmed.replace(/"/g, '\\"')}")`
}

const bgImage = computed({
  // 展示时去掉包裹的 url()，输入时再封装
  get: () => {
    const raw = theme.value?.backgroundImage || ''
    const match = raw.match(/^url\(["']?(.*?)["']?\)$/i)
    return match ? match[1] : raw
  },
  set: (val) => {
    updateCustomTheme({ backgroundImage: normalizeBgImage(val) })
  }
})

const bgOpacity = computed({
  get: () => (typeof theme.value?.bgOpacity !== 'undefined' ? String(theme.value.bgOpacity) : '1'),
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

const handleLocalImageUpload = async (event) => {
  const file = event?.target?.files?.[0]
  if (!file) return

  // 简单大小限制，避免 localStorage 存过大的 dataURL
  const MAX_SIZE = 2 * 1024 * 1024 // 2MB
  if (file.size > MAX_SIZE) {
    window.alert('图片体积较大，请选择 2MB 以内的图片')
    event.target.value = ''
    return
  }

  const readAsDataURL = (f) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(f)
    })

  try {
    const dataUrl = await readAsDataURL(file)
    updateCustomTheme({ backgroundImage: normalizeBgImage(dataUrl) })
  } catch (err) {
    console.error('读取本地图片失败', err)
    window.alert('读取图片失败，请重试')
  } finally {
    event.target.value = ''
  }
}
</script>

<template>
  <div class="p-4 space-y-4 text-xs">
    <div class="space-y-2">
      <label class="block text-slate-500 dark:text-slate-400">主色</label>
      <div class="flex items-center gap-3">
        <input
          v-model="primary"
          type="color"
          class="h-8 w-12 rounded border border-slate-300 dark:border-slate-600"
        />
        <input
          v-model="primary"
          type="text"
          class="flex-1 rounded border px-2 py-1 text-xs border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60"
          placeholder="#3b82f6"
        />
      </div>
    </div>

    <div class="space-y-2">
      <label class="block text-slate-500 dark:text-slate-400">背景色</label>
      <div class="flex items-center gap-3">
        <input
          v-model="background"
          type="color"
          class="h-8 w-12 rounded border border-slate-300 dark:border-slate-600"
        />
        <input
          v-model="background"
          type="text"
          class="flex-1 rounded border px-2 py-1 text-xs border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60"
          placeholder="#ffffff"
        />
      </div>
    </div>

    <div class="space-y-2">
      <label class="block text-slate-500 dark:text-slate-400">背景图片 URL（可选）</label>
      <input
        v-model="bgImage"
        type="text"
        class="w-full rounded border px-2 py-1 text-xs border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60"
        placeholder="如 https://xxx/xxx.jpg，不填则使用纯色背景"
      />
      <div class="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <label class="file-button">
          选择本地图片
          <input type="file" accept="image/*" class="file-input" @change="handleLocalImageUpload" />
        </label>
      </div>
      <p class="text-[11px] text-slate-400 dark:text-slate-500">
        本地文件建议 2MB 以内，或使用可跨域的 URL 地址。
      </p>
    </div>

    <div class="space-y-2">
      <label class="block text-slate-500 dark:text-slate-400">背景图透明度（0-1）</label>
      <div class="flex items-center gap-3">
        <input v-model="bgOpacity" type="range" min="0" max="1" step="0.05" class="flex-1" />
        <input
          v-model="bgOpacity"
          type="number"
          min="0"
          max="1"
          step="0.05"
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
          class="flex-1"
          @input="(e) => (bgBlur = `${e.target.value}px`)"
        />
        <input
          type="number"
          min="0"
          max="30"
          step="1"
          :value="parseInt(bgBlur, 10) || 0"
          class="w-16 rounded border px-2 py-1 text-xs border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-right"
          @input="(e) => (bgBlur = `${e.target.value || 0}px`)"
        />
      </div>
    </div>

    <p v-if="!isCustom" class="text-[11px] text-amber-500">
      当前不是“自定义主题”，调整后会自动切换到自定义主题。
    </p>
  </div>
</template>
<style scoped>
.file-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--color-border, #e5e7eb);
  background: color-mix(in srgb, var(--color-surface, #f8fafc) 70%, transparent 30%);
  color: inherit;
  cursor: pointer;
  font-size: 12px;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
  position: relative;
  overflow: hidden;
}

.file-button:hover {
  background: color-mix(in srgb, var(--color-surface-variant, #e5e7eb) 70%, transparent 30%);
  border-color: var(--color-border, #e5e7eb);
}

.file-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
</style>
