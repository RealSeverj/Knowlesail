<script setup>
// 待办事项页面
</script>

<template>
  <div class="todo-view min-h-screen bg-background flex items-center justify-center p-6">
    <div class="text-center">
      <var-icon
        name="checkbox-marked-circle-outline"
        :size="64"
        color="var(--color-primary)"
        class="mb-4"
      />
      <h1 class="text-2xl font-bold text-foreground mb-2">待办事项</h1>
      <p class="text-secondary">智能代办管理功能即将上线</p>
    </div>
  </div>
</template>

<style scoped>
.todo-view {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
