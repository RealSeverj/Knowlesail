<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ChatHeader from '@/components/Home/ChatHeader.vue'
import ChatInterface from '@/components/Home/ChatInterface.vue'
import InputBox from '@/components/Home/InputBox.vue'
import { useChatStore } from '@/stores/chat'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()

const inputExpanded = ref(false)
const lastBottomState = ref(false)

const handleBottomStateChange = (atBottom) => {
  lastBottomState.value = atBottom

  if (chatStore.isStreaming) return

  // 只在从「非底部」进入「底部」的一瞬间自动展开
  if (atBottom && !inputExpanded.value) {
    inputExpanded.value = true
  }
}

watch(
  () => chatStore.isStreaming,
  (streaming) => {
    if (streaming) {
      inputExpanded.value = true
      return
    }
  }
)

// ========== 路由会话同步 ==========
/**
 * 根据路由参数切换或加载会话
 */
const ensureConversationFromRoute = async () => {
  const conversationId = route.params.conversationId

  // 没带 id：跳转到 LiveAssistence 页面
  if (!conversationId) {
    router.replace({ name: 'Home' })
    return
  }

  // 如果当前已经是这个会话，无需切换
  if (chatStore.currentConversationId === conversationId) {
    return
  }

  // 如果本地已有这个会话，直接切换
  const exists = chatStore.conversations.find((c) => c.id === conversationId)
  if (exists) {
    chatStore.switchConversation(conversationId)
    return
  }

  // 本地没有：创建一个占位会话，并尝试从后端加载历史
  const newConv = {
    id: conversationId,
    title: '加载中...',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
    isCloudSync: true, // 标记为云端同步的会话
    cloudSyncTime: null // 实际同步时间在加载成功后设置
  }
  chatStore.conversations.unshift(newConv)
  chatStore.currentConversationId = conversationId

  try {
    await chatStore.loadConversationHistory(conversationId)
  } catch (e) {
    console.error('加载会话失败', e)
    // 加载失败时跳回无 id 的首页
    router.replace({ name: 'Home' })
  }
}

// 初次进入页面时处理
onMounted(() => {
  ensureConversationFromRoute()
})

// 路由参数变化时重新处理
watch(
  () => route.params.conversationId,
  (newId, oldId) => {
    if (newId !== oldId) {
      ensureConversationFromRoute()
    }
  }
)
</script>

<template>
  <div class="flex h-full flex-col">
    <ChatHeader />
    <div class="flex-1 min-h-0 flex">
      <ChatInterface
        class="flex-1 min-h-0"
        @bottom-state-change="handleBottomStateChange"
        @leave-bottom-by-scroll="inputExpanded = false"
      />
    </div>
    <InputBox v-model="inputExpanded" />
  </div>
</template>

<style scoped></style>
