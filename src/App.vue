<script setup>
import { onMounted, provide, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useBackButtonHandler } from './composables/useBackButtonHandler'
import { applyStatusBarTheme } from '@/composables/useStatusBar'
import AppLayout from '@/components/Layout/AppLayout.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import ConfirmDialogHost from '@/components/ConfirmDialog.vue'

const { theme, initTheme } = useTheme()

onMounted(async () => {
  await initTheme()
  await applyStatusBarTheme(theme.value)
})

// 监听主题配置变化，动态同步原生状态栏样式
watch(
  theme,
  async (newTheme) => {
    if (!newTheme) return
    await applyStatusBarTheme(newTheme)
  },
  { deep: true }
)

// 全局注入主题信息
provide('theme', theme)

useBackButtonHandler({
  mainRouteNames: ['Home', 'Todo', 'Curriculum', 'Profile', 'MyNotes'],
})
</script>

<template>
  <ToastContainer />
  <ConfirmDialogHost />
  <div
    id="app"
    class="min-h-screen app-bg text-foreground transition-colors"
  >
    <AppLayout />
  </div>
</template>