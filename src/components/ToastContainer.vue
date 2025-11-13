<script setup>
import { h } from 'vue'
import { useToastBus } from '@/composables/useToast'

const { toasts, remove } = useToastBus()

function getToastClass(type) {
  const classes = {
    info: 'bg-blue-500/95 text-white',
    success: 'bg-green-500/95 text-white',
    warning: 'bg-amber-500/95 text-white',
    error: 'bg-red-500/95 text-white'
  }
  return classes[type] || classes.info
}

function getIcon(type) {
  const icons = {
    info: () =>
      h(
        'svg',
        {
          class: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            'd': 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          })
        ]
      ),
    success: () =>
      h(
        'svg',
        {
          class: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            'd': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
          })
        ]
      ),
    warning: () =>
      h(
        'svg',
        {
          class: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            'd': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
          })
        ]
      ),
    error: () =>
      h(
        'svg',
        {
          class: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            'd': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
          })
        ]
      )
  }
  return icons[type] || icons.info
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none w-[calc(100%-2rem)] max-w-md"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto',
            'px-4 py-3 rounded-xl shadow-lg',
            'backdrop-blur-md',
            'flex items-center gap-3',
            'transform transition-all duration-300',
            getToastClass(toast.type)
          ]"
        >
          <!-- 图标 -->
          <div class="flex-shrink-0">
            <component :is="getIcon(toast.type)" class="w-5 h-5" />
          </div>

          <!-- 消息内容 -->
          <div class="flex-1 text-sm font-medium">
            {{ toast.message }}
          </div>

          <!-- 关闭按钮 -->
          <button
            class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            @click="remove(toast.id)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-1rem) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(2rem) scale(0.9);
}

.toast-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
