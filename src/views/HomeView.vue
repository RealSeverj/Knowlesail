<script setup>
import { ref, watch } from 'vue'
import ChatHeader from '@/components/Home/ChatHeader.vue'
import ChatInterface from '@/components/Home/ChatInterface.vue'
import InputBox from '@/components/Home/InputBox.vue'
import { useChatStore } from '@/stores/chat'


const chatStore = useChatStore()

const inputExpanded = ref(false)
const inputOffset = ref(0)
const autoPinned = ref(false)
const lastBottomState = ref(false)

const handleBottomStateChange = (atBottom) => {
  lastBottomState.value = atBottom

  if (chatStore.isStreaming) return

  // 只在从「非底部」进入「底部」的一瞬间自动展开
  if (atBottom && !autoPinned.value && !inputExpanded.value) {
    expandInput(true)
    return
  }
}

const expandInput = (isAuto = false) => {
  inputExpanded.value = true
  autoPinned.value = isAuto
}

const collapseInput = () => {
  if (chatStore.isStreaming) return
  inputExpanded.value = false
  autoPinned.value = false
}

const handleRequestExpand = () => {
  expandInput(false)
}

const handleRequestCollapse = () => {
  collapseInput()
}

const handleHeightChange = (height) => {
  inputOffset.value = height
}

watch(
  () => chatStore.isStreaming,
  (streaming) => {
    if (streaming) {
      expandInput(true)
      return
    }
  }
)

const handleViewportExpand = () => {
  // 若当前是自动展开，则点击聊天区域不改变状态
  if (autoPinned.value) return

  if (inputExpanded.value) {
    collapseInput()
  } else {
    expandInput(false)
  }
}

const handleLeaveBottomByScroll = () => {
  if (chatStore.isStreaming) return
  // 只对「自动展开」的输入框执行自动收起
  if (autoPinned.value && inputExpanded.value) {
    collapseInput()
  }
}
</script>

<template>
  <div class="flex h-full flex-col">
    <ChatHeader />
    <div class="flex-1 min-h-0 flex">
      <ChatInterface
        class="flex-1 min-h-0"
        :bottom-offset="inputOffset"
        @bottom-state-change="handleBottomStateChange"
        @request-input-expand="handleViewportExpand"
        @leave-bottom-by-scroll="handleLeaveBottomByScroll"
      />
    </div>
    <InputBox
      :expanded="inputExpanded"
      @request-expand="handleRequestExpand"
      @request-collapse="handleRequestCollapse"
      @height-change="handleHeightChange"
    />
  </div>
</template>

<style scoped>
</style>
