<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleMockLogin = () => {
  const devUser = {
    id: 'dev',
    name: '开发模式用户',
    role: 'dev'
  }

  authStore.login(devUser, 'dev-mock-token')
  router.replace({ name: 'Home' })
}
</script>

<template>
  <div class="login-page min-h-screen bg-background flex items-center justify-center p-6">
    <div class="text-center max-w-md w-full">
      <var-icon name="account-circle" :size="80" color="var(--color-primary)" class="mb-6" />
      <h1 class="text-3xl font-bold text-foreground mb-2">学海智航</h1>
      <p class="text-secondary mb-8">智能学习助手平台</p>
      <p class="text-sm text-tertiary mb-6">登录功能开发中...</p>

      <var-button type="primary" round block @click="handleMockLogin">
        一键模拟登录（开发阶段）
      </var-button>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  background: linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 100%);
}
</style>
