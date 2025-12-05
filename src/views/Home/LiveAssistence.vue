<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'

const router = useRouter()
const chatStore = useChatStore()

// 最近的一个对话
const lastConversation = computed(() => chatStore.conversations[0] || null)

// 是否有历史对话
const hasLastConversation = computed(() => !!lastConversation.value)

// 开启新对话
const startNewChat = () => {
  const conversation = chatStore.createConversation()
  router.push({ name: 'Chat', params: { conversationId: conversation.id } })
}

// 打开上一次会话
const openLastChat = () => {
  if (lastConversation.value) {
    router.push({ name: 'Chat', params: { conversationId: lastConversation.value.id } })
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 顶部标题区 -->
    <header class="flex items-center justify-between px-4 pb-2 pt-4">
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-semibold text-[var(--color-text-primary)]">智能助手</h1>
        <p class="mt-1 text-xs text-[var(--color-text-secondary)]">随时为你解答疑问</p>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="flex-1 flex flex-col items-center justify-center px-6">
      <!-- Logo / 图标区域 -->
      <div class="mb-8">
        <img src="/icon.png" alt="Logo" class="w-52 h-52 object-contain" />
      </div>

      <!-- 欢迎文字 -->
      <div class="text-center mb-10">
        <h2 class="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
          你好，有什么可以帮你的？
        </h2>
        <p class="text-[var(--color-text-secondary)] text-sm">
          我可以帮你解答问题、整理笔记、规划学习
        </p>
      </div>

      <!-- 操作按钮区 -->
      <div class="w-full max-w-xs space-y-4">
        <!-- 开启新对话 -->
        <var-button
          type="primary"
          block
          class="!h-[52px] !rounded-lg !font-medium !text-[15px]"
          @click="startNewChat"
        >
          <var-icon name="plus" :size="20" class="mr-2" />
          开启新对话
        </var-button>

        <!-- 打开上一次会话 -->
        <var-button
          v-if="hasLastConversation"
          block
          class="!h-[52px] !rounded-lg !font-medium !text-[15px] !bg-[var(--color-surface)] !text-[var(--color-text-primary)] !border !border-[var(--color-border)] hover:!bg-[var(--color-surface-variant)] hover:!border-[var(--color-primary)]"
          @click="openLastChat"
        >
          <var-icon name="message-text-outline" :size="20" class="mr-2" />
          打开上一次会话
        </var-button>
      </div>
    </main>

    <!-- 底部提示 -->
    <footer class="px-6 py-4 text-center">
      <p class="text-xs text-[var(--color-text-secondary)]">
        AI 生成内容仅供参考，请注意甄别
      </p>
    </footer>
  </div>
</template>

<style scoped>
/* 保留空的 style 块以备后续扩展 */
</style>
