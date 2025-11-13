<script setup>
import { onMounted, provide } from 'vue'
import { useTheme } from '@/composables/useTheme'
import AppLayout from '@/components/Layout/AppLayout.vue'

const { theme, initTheme } = useTheme()

onMounted(() => {
  initTheme()
})

// 全局注入主题信息
provide('theme', theme)
</script>

<template>
  <div id="app" class="min-h-screen bg-background text-foreground transition-colors">
    <AppLayout />
  </div>
</template>
