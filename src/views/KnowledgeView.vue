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
  <div class="knowledge-view h-full flex flex-col">
    <header class="flex items-center justify-between px-4 pb-2 pt-4">
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-semibold text-[var(--color-text-primary)]">知识库</h1>
        <p class="mt-1 text-xs text-[var(--color-text-secondary)]">在此查看你的笔记</p>
      </div>
      <div class="flex items-center gap-2 ml-3">
        <!-- 保留搜索图标并优化搜索框高度 -->
        <div class="flex items-center gap-2 bg-surface rounded-full shadow-sm px-2 h-9 w-42">
          <span class="flex h-7 w-7 items-center justify-center rounded-full">
            <var-icon name="magnify" :size="20" />
          </span>
          <input
            v-model="searchKeyword"
            type="search"
            class="flex-1 h-7 bg-transparent text-xs text-[var(--color-text-primary)] outline-none placeholder-[var(--color-text-secondary)]"
            placeholder="搜索你的笔记"
            @keyup.enter.prevent="handleSearchSubmit"
          />
        </div>
      </div>
    </header>
    <!-- 顶部标签导航 -->
    <var-tabs v-model:active="activeTab" class="knowledge-tabs">
      <var-tab>官方知识库</var-tab>
      <var-tab>学习社区</var-tab>
      <var-tab>我的笔记</var-tab>
    </var-tabs>

    <!-- 子路由区域：用于展示搜索结果等子页面 -->
    <router-view v-slot="{ Component, route }">
      <!-- 当为搜索路由时，直接展示搜索结果组件 -->
      <component
        :is="Component"
        v-if="route.name === 'KnowledgeSearch'"
        class="flex-1 overflow-y-auto"
      />

      <!-- 默认知识库主内容：标签 + 滑动页 -->
      <template v-else>
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
      </template>
    </router-view>
  </div>
</template>

<style scoped>
.knowledge-tabs {
  background-color: transparent;
  position: sticky;
  top: 0;
  z-index: 10;
}

.knowledge-swipe {
  height: calc(100vh - 172px); /* 减去头部底部和标签栏高度 */
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
