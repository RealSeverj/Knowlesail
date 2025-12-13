<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getItem } from '@/utils/storage'
import DefaultPageSetting from '@/components/Profile/DefaultPageSetting.vue'
import VisualizationLibSetting from '@/components/Profile/VisualizationLibSetting.vue'

const router = useRouter()

// 偏好设置数据
const defaultPage = ref(getItem('pref_default_page', 'Home'))

// 处理页面选择
const handleSelect = (pageName) => {
  defaultPage.value = pageName
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
      <DefaultPageSetting :default-page="defaultPage" @select-page="handleSelect" />

      <!-- 可视化库设置 -->
      <VisualizationLibSetting />

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
