<script setup>
import { ref, watch, nextTick, onMounted, defineAsyncComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// 异步加载子页面组件
const OfficialPage = defineAsyncComponent(() => import('./Knowledge/OfficialPage.vue'))
const CommunityPage = defineAsyncComponent(() => import('./Knowledge/CommunityPage.vue'))
const MyNotesPage = defineAsyncComponent(() => import('./Knowledge/MyNotesPage.vue'))

const router = useRouter()
const route = useRoute()
const activeTab = ref(2) // 默认显示我的笔记
const searchOpen = ref(false)
const searchKeyword = ref('')
const swipeRef = ref(null)
const isInternalChange = ref(false) // 用于防止循环触发

// 根据当前路由设置激活标签
watch(
  () => route.name,
  (newName) => {
    let newIndex = -1
    if (newName === 'OfficialKnowledge') newIndex = 0
    else if (newName === 'CommunityKnowledge') newIndex = 1
    else if (newName === 'MyNotes') newIndex = 2
    
    if (newIndex >= 0 && activeTab.value !== newIndex) {
      isInternalChange.value = true
      activeTab.value = newIndex
      nextTick(() => {
        swipeRef.value?.to(newIndex)
        isInternalChange.value = false
      })
    }
  },
  { immediate: true }
)

// 监听标签点击切换
watch(activeTab, (newTab, oldTab) => {
  if (isInternalChange.value) return
  
  // 同步滑动组件
  swipeRef.value?.to(newTab)
  
  // 更新路由
  const routes = ['OfficialKnowledge', 'CommunityKnowledge', 'MyNotes']
  const targetRoute = routes[newTab]
  if (route.name !== targetRoute) {
    router.replace({ name: targetRoute })
  }
})

// 滑动切换回调
function onSwipeChange(index) {
  if (activeTab.value === index) return
  
  isInternalChange.value = true
  activeTab.value = index
  
  // 更新路由
  const routes = ['OfficialKnowledge', 'CommunityKnowledge', 'MyNotes']
  const targetRoute = routes[index]
  if (route.name !== targetRoute) {
    router.replace({ name: targetRoute })
  }
  
  nextTick(() => {
    isInternalChange.value = false
  })
}

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

onMounted(() => {
  // 初始化时同步滑动位置
  nextTick(() => {
    swipeRef.value?.to(activeTab.value)
  })
})
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

    <!-- 滑动内容区域 -->
    <var-swipe
      ref="swipeRef"
      class="knowledge-swipe"
      :touchable="true"
      :indicator="false"
      :loop="false"
      @change="onSwipeChange"
    >
      <var-swipe-item class="swipe-item">
        <div class="p-4">
          <OfficialPage />
        </div>
      </var-swipe-item>
      <var-swipe-item class="swipe-item">
        <div class="p-4">
          <CommunityPage />
        </div>
      </var-swipe-item>
      <var-swipe-item class="swipe-item">
        <div class="p-4">
          <MyNotesPage />
        </div>
      </var-swipe-item>
    </var-swipe>
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

.knowledge-swipe {
  height: calc(100vh - 140px); /* 减去头部和标签栏高度 */
  overflow: hidden;
}

.swipe-item {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
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
