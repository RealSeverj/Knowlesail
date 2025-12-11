<script setup>
import { onMounted } from 'vue'
import { useLibraryCache } from '@/composables/useLibraryCache'

const { allLibs, initialize, toggleLibrary } = useLibraryCache()

onMounted(() => {
  initialize()
})

const handleToggle = (lib) => {
  toggleLibrary(lib.id, !lib.enabled)
}
</script>

<template>
  <section class="rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-slate-800/80">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <var-icon name="chart-box-outline" :size="20" color="var(--color-primary)" />
        <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-50">可视化库管理</h2>
      </div>
      <span class="text-[11px] text-slate-400 dark:text-slate-500">管理图表渲染引擎</span>
    </div>

    <div class="space-y-2">
      <button
        v-for="lib in allLibs"
        :key="lib.id"
        class="flex w-full items-center gap-3 rounded-xl p-3 transition-all duration-200"
        :class="[
          lib.enabled
            ? 'bg-blue-50 ring-2 ring-blue-500/30 dark:bg-blue-500/10'
            : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/60 dark:hover:bg-slate-700'
        ]"
        @click="handleToggle(lib)"
      >
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full"
          :class="[
            lib.enabled
              ? 'bg-blue-100 text-blue-500 dark:bg-blue-500/20'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-600 dark:text-slate-400'
          ]"
        >
          <var-icon name="code-json" :size="22" />
        </div>
        <div class="flex-1 text-left">
          <div class="flex items-center gap-2">
            <p
              class="text-sm font-medium"
              :class="[
                lib.enabled
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-800 dark:text-slate-100'
              ]"
            >
              {{ lib.name }}
            </p>
            <span
              v-if="lib.cached"
              class="rounded bg-green-100 px-1.5 py-0.5 text-[10px] text-green-600 dark:bg-green-900/30 dark:text-green-400"
            >
              已缓存
            </span>
            <span
              v-else-if="lib.downloading"
              class="rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
            >
              下载中
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            v{{ lib.version }}
            <span v-if="lib.cacheSize"> · {{ (lib.cacheSize / 1024).toFixed(1) }}KB</span>
          </p>
        </div>

        <div
          class="relative h-6 w-11 rounded-full transition-colors duration-200"
          :class="lib.enabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'"
        >
          <div
            class="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200"
            :class="lib.enabled ? 'translate-x-5' : 'translate-x-0'"
          ></div>
        </div>
      </button>
    </div>
  </section>
</template>
