<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const activeTab = ref(2) // 默认显示我的笔记
const searchOpen = ref(false)
const searchKeyword = ref('')

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

function toggleSearch() {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) {
    // 切换到搜索状态时清空关键字
    searchKeyword.value = ''
  }
}

function handleSearchSubmit() {
  const keyword = searchKeyword.value.trim()
  if (!keyword) return
  router.push({ name: 'KnowledgeSearch', query: { q: keyword } })
}
</script>

<template>
  <div class="knowledge-view min-h-screen">
    <header class="flex items-center justify-between px-4 pb-2 pt-4">
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-semibold text-[var(--color-text-primary)]">知识库</h1>
        <p class="mt-1 text-xs text-[var(--color-text-secondary)]">在此查看你的笔记</p>
      </div>
      <div class="flex items-center gap-2 ml-3">
        <!-- 搜索按钮 + 输入框 -->
        <div
          class="flex items-center gap-2 bg-surface rounded-full shadow-sm px-2 py-1 transition-all duration-200"
          :class="searchOpen ? 'w-56' : 'w-9 justify-center'"
        >
          <button
            class="flex h-7 w-7 items-center justify-center rounded-full hover:bg-surface-variant transition-colors"
            @click="toggleSearch"
          >
            <var-icon name="magnify" :size="20" />
          </button>
          <transition name="fade-width">
            <input
              v-if="searchOpen"
              v-model="searchKeyword"
              type="search"
              class="flex-1 bg-transparent text-xs text-[var(--color-text-primary)] outline-none placeholder-[var(--color-text-secondary)]"
              placeholder="搜索官方、社区或我的笔记"
              @keyup.enter.prevent="handleSearchSubmit"
            />
          </transition>
        </div>

        <!-- 原有按钮保留，样式保持一致 -->
        <button
          class="icon-circle-btn"
          @click="handleOpenAdd"
        >
          <var-icon name="format-list-checkbox" :size="24" />
        </button>
      </div>
    </header>
    <!-- 顶部标签导航 -->
    <var-tabs v-model:active="activeTab" class="knowledge-tabs">
      <var-tab>官方知识库</var-tab>
      <var-tab>学习社区</var-tab>
      <var-tab>我的笔记</var-tab>
    </var-tabs>

    <!-- 内容区域 -->
    <div class="p-4">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.knowledge-tabs {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.fade-width-enter-active,
.fade-width-leave-active {
  transition: opacity 0.16s ease;
}

.fade-width-enter-from,
.fade-width-leave-to {
  opacity: 0;
}
</style>
