<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navItems = [
  {
    name: 'Curriculum',
    icon: 'calendar-month',
    label: '课程表',
    path: '/curriculum'
  },
  {
    name: 'Todo',
    icon: 'checkbox-marked-circle-outline',
    label: '待办',
    path: '/todo'
  },
  {
    name: 'Home',
    icon: 'home',
    label: '助手',
    path: '/home'
  },
  {
    name: 'Knowledge',
    icon: 'notebook',
    label: '知识库',
    path: '/knowledge'
  },
  {
    name: 'Profile',
    icon: 'account-circle',
    label: '我的',
    path: '/profile'
  }
]

// 可写的 computed，用于与底部导航的 v-model 交互
const activeTab = computed({
  get() {
    // 对于知识库的子路由，也高亮知识库标签
    if (route.path.startsWith('/knowledge')) {
      return 'Knowledge'
    }
    return route.name
  },
  set(val) {
    const target = navItems.find((n) => n.name === val)
    if (!target) return
    if (route.path !== target.path) {
      router.push(target.path)
    }
  }
})
</script>

<template>
  <var-bottom-navigation v-model:active="activeTab" fixed safe-area class="bottom-nav">
    <var-bottom-navigation-item
      v-for="item in navItems"
      :key="item.name"
      :name="item.name"
      :icon="item.icon"
      :label="item.label"
    />
  </var-bottom-navigation>
</template>

<style scoped>
.bottom-nav {
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  /* 确保底部导航在最底层,输入框在其之上 */
  z-index: 50 !important;
}

:deep(.var-bottom-navigation-item) {
  color: var(--color-text-secondary);
}

:deep(.var-bottom-navigation-item--active) {
  color: var(--color-primary);
}
</style>
