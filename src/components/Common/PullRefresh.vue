<template>
  <var-pull-refresh
    v-model="refreshing"
    :disabled="disabled"
    class="pull-refresh-container"
    @refresh="handleRefresh"
  >
    <template #default>
      <slot />
    </template>
    <template #loading>
      <div class="flex items-center justify-center gap-2 py-2">
        <var-loading type="circle" :size="20" />
        <span class="text-sm text-[var(--color-text-secondary)]">{{ loadingText }}</span>
      </div>
    </template>
    <template #loosing>
      <div class="flex items-center justify-center gap-2 py-2">
        <var-icon name="arrow-up" :size="20" class="text-[var(--color-text-secondary)]" />
        <span class="text-sm text-[var(--color-text-secondary)]">{{ loosingText }}</span>
      </div>
    </template>
    <template #pulling>
      <div class="flex items-center justify-center gap-2 py-2">
        <var-icon name="arrow-down" :size="20" class="text-[var(--color-text-secondary)]" />
        <span class="text-sm text-[var(--color-text-secondary)]">{{ pullingText }}</span>
      </div>
    </template>
    <template #success>
      <div class="flex items-center justify-center gap-2 py-2">
        <var-icon name="check" :size="20" class="text-[var(--color-success)]" />
        <span class="text-sm text-[var(--color-success)]">{{ successText }}</span>
      </div>
    </template>
  </var-pull-refresh>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  // 是否禁用下拉刷新
  disabled: {
    type: Boolean,
    default: false
  },
  // 加载中文字
  loadingText: {
    type: String,
    default: '正在刷新...'
  },
  // 释放刷新文字
  loosingText: {
    type: String,
    default: '释放刷新'
  },
  // 下拉中文字
  pullingText: {
    type: String,
    default: '下拉刷新'
  },
  // 刷新成功文字
  successText: {
    type: String,
    default: '刷新成功'
  },
  // 外部控制的刷新状态
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const refreshing = ref(props.modelValue)

// 同步外部 modelValue
watch(
  () => props.modelValue,
  (val) => {
    refreshing.value = val
  }
)

// 同步内部状态到外部
watch(refreshing, (val) => {
  emit('update:modelValue', val)
})

async function handleRefresh() {
  emit('refresh')
}
</script>

<style scoped>
.pull-refresh-container {
  height: 100%;
  overflow: auto;
}

.pull-refresh-container :deep(.var-pull-refresh__control) {
  border-radius: 9999px;
  padding: 4px 12px;
}
</style>
