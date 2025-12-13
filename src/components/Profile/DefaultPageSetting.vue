<script setup>
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { setItem } from '@/utils/storage'

// 页面选项
const pageOptions = [
  { name: 'Curriculum', label: '课程表', icon: 'calendar-month', desc: '查看课程安排' },
  { name: 'Todo', label: '待办事项', icon: 'checkbox-marked-circle-outline', desc: '管理学习任务' },
  { name: 'Home', label: '智能助手', icon: 'chat-processing', desc: 'AI 问答与辅导' },
  { name: 'Knowledge', label: '知识库', icon: 'notebook', desc: '浏览笔记与资料' },
  { name: 'Profile', label: '个人中心', icon: 'account-circle', desc: '设置与个人信息' }
]

// Props
const props = defineProps({
  defaultPage: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['selectPage'])

const toast = useToast()

// 选择页面时自动保存
const selectPage = (pageName) => {
  if (props.defaultPage !== pageName) {
    emit('selectPage', pageName)
    setItem('pref_default_page', pageName)
    toast.success('已保存')
  }
}
</script>

<template>
  <section class="rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-slate-800/80">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <var-icon name="home-outline" :size="20" color="var(--color-primary)" />
        <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-50">默认打开页面</h2>
      </div>
      <span class="text-[11px] text-slate-400 dark:text-slate-500">应用启动时打开</span>
    </div>

    <div class="space-y-2">
      <button
        v-for="option in pageOptions"
        :key="option.name"
        class="flex w-full items-center gap-3 rounded-xl p-3 transition-all duration-200"
        :class="[
          props.defaultPage === option.name
            ? 'bg-blue-50 ring-2 ring-blue-500/30 dark:bg-blue-500/10'
            : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/60 dark:hover:bg-slate-700'
        ]"
        @click="selectPage(option.name)"
      >
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full"
          :class="[
            props.defaultPage === option.name
              ? 'bg-blue-100 text-blue-500 dark:bg-blue-500/20'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-600 dark:text-slate-400'
          ]"
        >
          <var-icon :name="option.icon" :size="22" />
        </div>
        <div class="flex-1 text-left">
          <p
            class="text-sm font-medium"
            :class="[
              props.defaultPage === option.name
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-800 dark:text-slate-100'
            ]"
          >
            {{ option.label }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ option.desc }}</p>
        </div>
        <div
          v-if="props.defaultPage === option.name"
          class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white"
        >
          <var-icon name="check" :size="14" />
        </div>
      </button>
    </div>
  </section>
</template>
