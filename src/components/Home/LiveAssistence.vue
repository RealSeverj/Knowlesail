<script setup>
import QuickActions from './QuickActions.vue'

const props = defineProps({
  actions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const handleSelect = (action) => {
  emit('select', action)
}
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
    <div class="rounded-full bg-[var(--color-surface)] p-6 text-[var(--color-primary)]">
      <var-icon name="chat-processing-outline" :size="56" />
    </div>

    <div class="space-y-2">
      <h3 class="text-xl font-semibold text-[var(--color-text-primary)]">智能学习助手</h3>
      <p class="text-sm text-[var(--color-text-secondary)]">
        我会根据你的学习计划与进度，主动提醒待办、课程安排和预习资料。
      </p>
    </div>

    <div v-if="loading" class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
      <var-loading type="cube" size="20" />
      <span>正在为你获取今日推荐...</span>
    </div>

    <QuickActions :actions="actions" @select="handleSelect" />
  </div>
</template>

<style scoped></style>
