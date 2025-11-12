<script setup>
import { onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import AppLayout from '@/components/Layout/AppLayout.vue'

const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<template>
  <div id="app" class="min-h-screen bg-background text-foreground transition-colors">
    <AppLayout />
  </div>
</template>
