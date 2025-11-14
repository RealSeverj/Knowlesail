<template>
  <Transition name="dialog-fade">
    <div
      v-if="state.open"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="handleCancel"
    >
      <!-- 背景遮罩 -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <!-- 对话框内容 -->
      <div
        class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[calc(100%-2rem)] max-w-md mx-4 overflow-hidden transform transition-all"
      >
        <!-- 标题栏 -->
        <div class="px-6 pt-6 pb-4">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ state.title }}
          </h3>
        </div>

        <!-- 消息内容 -->
        <div class="px-6 pb-6">
          <p class="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            {{ state.message }}
          </p>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-3 px-6 pb-6">
          <button
            class="flex-1 px-4 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all duration-200"
            @click="handleCancel"
          >
            {{ state.cancelText }}
          </button>
          <button
            class="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-blue-500 hover:bg-blue-600 active:scale-95 shadow-lg shadow-blue-500/30 transition-all duration-200"
            @click="handleConfirm"
          >
            {{ state.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useConfirmBus } from '@/composables/useConfirm'

const { state, resolveConfirm, resolveCancel } = useConfirmBus()

function handleConfirm() {
  resolveConfirm(true)
}

function handleCancel() {
  resolveCancel(false)
}
</script>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-fade-enter-active > div:last-child,
.dialog-fade-leave-active > div:last-child {
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from > div:last-child,
.dialog-fade-leave-to > div:last-child {
  transform: scale(0.9);
  opacity: 0;
}
</style>
