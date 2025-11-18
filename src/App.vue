<script setup>
import { onMounted, provide } from 'vue'
import { useTheme } from '@/composables/useTheme'
import AppLayout from '@/components/Layout/AppLayout.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import ConfirmDialogHost from '@/components/ConfirmDialog.vue'

const { theme, initTheme } = useTheme()

onMounted(() => {
  initTheme()
})

// 全局注入主题信息
provide('theme', theme)
</script>

<template>
  <ToastContainer />
  <ConfirmDialogHost />
  <div id="app" class="min-h-screen app-bg text-foreground transition-colors">
    <AppLayout />
  </div>
</template>
