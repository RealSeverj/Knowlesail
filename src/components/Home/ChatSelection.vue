<!-- 聊天记录选择器组件 -->
<script setup>
import { ref, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { usePopupBackClose } from '@/composables/usePopupBackClose'

const props = defineProps({
  /** 是否显示选择器 */
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const chatStore = useChatStore()

// 计算属性用于双向绑定
const isOpen = computed({
  get() {
    return props.visible
  },
  set(v) {
    emit('update:visible', v)
  }
})

// 物理返回键优先关闭弹层
usePopupBackClose(isOpen, handleCancel)

// 已选择的消息 ID 集合
const selectedIds = ref(new Set())

// 当前对话的消息列表
const messages = computed(() => chatStore.currentMessages || [])

// 是否全选
const isAllSelected = computed(() => {
  if (messages.value.length === 0) return false
  return messages.value.every((m) => selectedIds.value.has(m.id))
})

// 选中数量
const selectedCount = computed(() => selectedIds.value.size)

/**
 * 切换单个消息的选中状态
 */
function toggleMessage(messageId) {
  if (selectedIds.value.has(messageId)) {
    selectedIds.value.delete(messageId)
  } else {
    selectedIds.value.add(messageId)
  }
  // 触发响应式更新
  selectedIds.value = new Set(selectedIds.value)
}

/**
 * 全选/取消全选
 */
function toggleAll() {
  if (isAllSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(messages.value.map((m) => m.id))
  }
}

/**
 * 确认选择
 */
function handleConfirm() {
  emit('confirm', Array.from(selectedIds.value))
  close()
}

/**
 * 取消选择
 */
function handleCancel() {
  emit('cancel')
  close()
}

/**
 * 关闭选择器
 */
function close() {
  selectedIds.value = new Set()
  emit('update:visible', false)
}

/**
 * 格式化消息预览
 */
function formatPreview(content, maxLen = 50) {
  if (!content) return ''
  const text = content.replace(/\n/g, ' ').trim()
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
}

/**
 * 格式化时间
 */
function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <var-popup
    v-model:show="isOpen"
    position="bottom"
    safe-area
    :overlay="true"
    :close-on-click-overlay="true"
    class="!bg-transparent"
    @click-overlay="handleCancel"
  >
    <div class="bg-background rounded-t-3xl max-h-[70vh] flex flex-col">
      <!-- 头部 -->
      <header class="p-4 flex items-center justify-between border-b border-[var(--color-border)]">
        <h2 class="text-base font-semibold text-[var(--color-text-primary)]">选择聊天记录</h2>
        <div class="flex items-center gap-3">
          <span class="text-xs text-[var(--color-text-secondary)]"
            >已选 {{ selectedCount }} 条</span
          >
          <var-button text size="small" class="text-primary" @click="toggleAll">
            {{ isAllSelected ? '取消全选' : '全选' }}
          </var-button>
          <button class="p-1 text-[var(--color-text-secondary)]" @click="handleCancel">
            <var-icon name="close" :size="18" />
          </button>
        </div>
      </header>

      <!-- 消息列表 -->
      <div class="flex-1 overflow-y-auto p-2 max-h-[50vh]">
        <div
          v-for="message in messages"
          :key="message.id"
          class="selection-item"
          :class="{ selected: selectedIds.has(message.id) }"
          @click="toggleMessage(message.id)"
        >
          <var-checkbox
            :model-value="selectedIds.has(message.id)"
            :ripple="false"
            @click.stop
            @update:model-value="toggleMessage(message.id)"
          />
          <div class="item-content">
            <div class="item-header">
              <span class="role-tag" :class="message.role">
                {{ message.role === 'user' ? '你' : 'AI' }}
              </span>
              <span class="item-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            <p class="item-preview">{{ formatPreview(message.content) }}</p>
          </div>
        </div>

        <div v-if="messages.length === 0" class="empty-state">
          <var-icon name="chat-outline" :size="48" color="var(--color-secondary)" />
          <p class="text-[var(--color-text-secondary)] text-sm mt-2">暂无聊天记录</p>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="p-4 border-t border-[var(--color-border)] flex gap-3">
        <var-button block text @click="handleCancel"> 跳过 </var-button>
        <var-button block type="primary" :disabled="selectedCount === 0" @click="handleConfirm">
          确认选择 ({{ selectedCount }})
        </var-button>
      </div>
    </div>
  </var-popup>
</template>

<style scoped>
.selection-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 8px;
}

.selection-item:hover {
  background-color: var(--color-surface);
}

.selection-item.selected {
  background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.role-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.role-tag.user {
  background-color: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
}

.role-tag.assistant {
  background-color: color-mix(in srgb, #10b981 15%, transparent);
  color: #10b981;
}

.item-time {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.item-preview {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
}
</style>
