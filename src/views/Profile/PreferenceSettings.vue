<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { setItem, getItem } from '@/utils/storage'

const router = useRouter()
const toast = useToast()

// 偏好设置数据
const defaultPage = ref(getItem('pref_default_page', 'Home'))

// 页面选项
const pageOptions = [
  { name: 'Curriculum', label: '课程表', icon: 'calendar-month', desc: '查看课程安排' },
  { name: 'Todo', label: '待办事项', icon: 'checkbox-marked-circle-outline', desc: '管理学习任务' },
  { name: 'Home', label: '智能助手', icon: 'chat-processing', desc: 'AI 问答与辅导' },
  { name: 'Knowledge', label: '知识库', icon: 'notebook', desc: '浏览笔记与资料' },
  { name: 'Profile', label: '个人中心', icon: 'account-circle', desc: '设置与个人信息' }
]

// 选择页面时自动保存
const selectPage = (pageName) => {
  if (defaultPage.value !== pageName) {
    defaultPage.value = pageName
    setItem('pref_default_page', pageName)
    toast.success('已保存')
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="preference-settings-page px-4 pb-4 pt-4">
    <div class="mx-auto flex max-w-screen-sm flex-col gap-4">
      <!-- 顶部导航栏 -->
      <section class="flex items-center gap-3">
        <button
          class="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700"
          @click="goBack"
        >
          <var-icon name="chevron-left" :size="22" />
        </button>
        <div class="flex-1">
          <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-50">偏好设置</h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">个性化配置你的应用体验</p>
        </div>
      </section>

      <!-- 默认打开页面设置 -->
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
              defaultPage === option.name
                ? 'bg-blue-50 ring-2 ring-blue-500/30 dark:bg-blue-500/10'
                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/60 dark:hover:bg-slate-700'
            ]"
            @click="selectPage(option.name)"
          >
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full"
              :class="[
                defaultPage === option.name
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
                  defaultPage === option.name
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-800 dark:text-slate-100'
                ]"
              >
                {{ option.label }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ option.desc }}</p>
            </div>
            <div
              v-if="defaultPage === option.name"
              class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white"
            >
              <var-icon name="check" :size="14" />
            </div>
          </button>
        </div>
      </section>

      <!-- 提示信息 -->
      <section
        class="flex items-start gap-3 rounded-2xl bg-blue-50/80 p-4 backdrop-blur dark:bg-blue-500/10"
      >
        <div
          class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20"
        >
          <var-icon name="information-outline" :size="18" color="var(--color-primary)" />
        </div>
        <div>
          <p class="text-sm font-medium text-slate-800 dark:text-slate-100">小提示</p>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            点击选项即可自动保存，偏好设置保存在本地，跨设备需重新配置
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.preference-settings-page {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'SF Pro Text',
    'Segoe UI',
    sans-serif;
  height: 100%;
  overflow-y: auto;
}
</style>
