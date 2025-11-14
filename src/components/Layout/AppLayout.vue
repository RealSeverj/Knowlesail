<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomNav from './BottomNav.vue'

const route = useRoute()

// 不显示底部导航的页面
const hideBottomNav = computed(() => {
  return ['Login', 'Register'].includes(route.name)
})

// 是否需要内边距（主导航页面不需要，子页面需要）
const needsPadding = computed(() => {
  const mainPages = ['Home', 'Curriculum', 'Todo', 'Knowledge', 'Profile']
  return !mainPages.includes(route.name) && !hideBottomNav.value
})
</script>

<template>
  <div class="app-layout">
    <!-- 主内容区 -->
    <main
      class="main-content"
      :class="{
        'p-4': needsPadding
      }"
    >
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部导航 -->
    <BottomNav v-if="!hideBottomNav" />
  </div>
</template>

<style scoped>
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  overflow: hidden;
  /* 预留底部导航高度 + 安全区，防止输入框被遮挡 */
  padding-bottom: calc(56px + env(safe-area-inset-bottom));
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
