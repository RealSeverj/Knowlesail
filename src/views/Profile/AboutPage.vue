<script setup>
import AppHeader from '@/components/Layout/AppHeader.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- 顶部导航 -->
    <AppHeader title="关于" showBack />

    <!-- 内容区域 -->
    <main class="flex-1">
      <div class="text-center py-12">
        <var-icon
          name="information"
          :size="48"
          color="var(--color-primary)"
          class="mb-3"
        />
        <h2 class="text-xl font-semibold text-foreground mb-2">Knowlesail</h2>
        <p class="text-secondary text-sm mb-4">学海智航 v1.0.0</p>
        <p class="text-tertiary text-xs">智能学习助手平台</p>
      </div>
    </main>
  </div>
</template>