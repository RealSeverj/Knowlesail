<script setup>
defineProps({
  stats: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <section class="rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-slate-800/80">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-50">学习数据</h2>
      <span class="text-[11px] text-slate-400 dark:text-slate-500">基于本应用统计</span>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <div class="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-700/60">
        <div class="rounded-full bg-blue-100 p-2 text-blue-500 dark:bg-blue-500/10">
          <var-icon name="notebook" :size="22" />
        </div>
        <div>
          <p class="text-xs text-slate-500 dark:text-slate-400">笔记总数</p>
          <p class="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {{ stats.notesCount }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-700/60">
        <div class="rounded-full bg-pink-100 p-2 text-pink-500 dark:bg-pink-500/10">
          <var-icon name="thumb-up" :size="22" />
        </div>
        <div>
          <p class="text-xs text-slate-500 dark:text-slate-400">笔记获赞</p>
          <p class="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {{ stats.notesLiked }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-700/60">
        <div class="rounded-full bg-emerald-100 p-2 text-emerald-500 dark:bg-emerald-500/10">
          <var-icon name="star" :size="22" />
        </div>
        <div>
          <p class="text-xs text-slate-500 dark:text-slate-400">笔记收藏</p>
          <p class="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {{ stats.notesCollected }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-700/60">
        <div class="rounded-full bg-amber-100 p-2 text-amber-500 dark:bg-amber-500/10">
          <var-icon name="checkbox-marked-circle-outline" :size="22" />
        </div>
        <div>
          <p class="text-xs text-slate-500 dark:text-slate-400">已完成待办</p>
          <p class="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {{ stats.todoCompleted }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
