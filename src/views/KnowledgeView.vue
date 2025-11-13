<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const activeTab = ref(2) // 默认显示我的笔记

// 根据当前路由设置激活标签
watch(
  () => route.name,
  (newName) => {
    if (newName === 'OfficialKnowledge') activeTab.value = 0
    else if (newName === 'CommunityKnowledge') activeTab.value = 1
    else if (newName === 'MyNotes') activeTab.value = 2
  },
  { immediate: true }
)

// 监听标签切换
watch(activeTab, (newTab) => {
  const routes = ['OfficialKnowledge', 'CommunityKnowledge', 'MyNotes']
  const targetRoute = routes[newTab]
  if (route.name !== targetRoute) {
    router.push({ name: targetRoute })
  }
})
</script>

<template>
  <div class="knowledge-view min-h-screen bg-background">
    <!-- 顶部标签导航 -->
    <var-tabs v-model:active="activeTab" class="knowledge-tabs">
      <var-tab>官方知识库</var-tab>
      <var-tab>社区共建</var-tab>
      <var-tab>我的笔记</var-tab>
    </var-tabs>

    <!-- 内容区域 -->
    <div class="p-4">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.knowledge-view {
  background-color: var(--color-background);
}

.knowledge-tabs {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
