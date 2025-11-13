<script setup>
import ChatInterface from '@/components/Home/ChatInterface.vue'
</script>

<template>
  <div class="home-view">
    <ChatInterface />
  </div>
</template>

<style scoped>
.home-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 确保不被底部导航覆盖,但预留底部导航空间 */
  padding-bottom: calc(56px + env(safe-area-inset-bottom));
}
</style>
