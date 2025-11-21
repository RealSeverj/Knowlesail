<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** 是否显示弹窗 */
  show: {
    type: Boolean,
    default: false
  },
  /** 是否显示遮罩 */
  overlay: {
    type: Boolean,
    default: true
  },
  /** 点击遮罩是否关闭 */
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  },
  /** 弹窗宽度类（tailwind class） */
  widthClass: {
    type: String,
    default: 'w-[88vw] max-w-sm'
  },
  /** 弹窗最大高度类 */
  maxHeightClass: {
    type: String,
    default: 'max-h-[70vh]'
  },
  /** 额外的弹窗自定义类 */
  frameClass: {
    type: String,
    default: ''
  },
  /** 是否显示关闭按钮 */
  showClose: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:show', 'close'])

const visible = computed({
  get() {
    return props.show
  },
  set(value) {
    emit('update:show', value)
    if (!value) emit('close')
  }
})

const handleOverlayClick = () => {
  if (!props.closeOnClickOverlay) return
  visible.value = false
}

const handleClose = () => {
  visible.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="popframe-fade">
      <div v-if="visible" class="popframe-root fixed inset-0 z-50 flex items-center justify-center">
        <!-- 遮罩层 -->
        <div
          v-if="overlay"
          class="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          @click="handleOverlayClick"
        />

        <!-- 弹窗主体 -->
        <Transition name="popframe-scale">
          <div
            v-if="visible"
            class="relative rounded-2xl bg-background p-4 shadow-xl ring-1 ring-slate-900/5 dark:bg-slate-800/95 dark:ring-slate-700/80"
            :class="[widthClass, maxHeightClass, frameClass]"
          >
            <!-- 右上角关闭按钮 -->
            <button
              v-if="showClose"
              type="button"
              class="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow-sm hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              @click="handleClose"
            >
              <var-icon name="window-close" :size="16" />
            </button>

            <!-- 标题插槽 -->
            <header v-if="$slots.header" class="mb-3 pr-7">
              <slot name="header" />
            </header>

            <!-- 内容区域 -->
            <section class="popframe-body max-h-full overflow-y-auto">
              <slot />
            </section>

            <!-- 底部操作区插槽 -->
            <footer v-if="$slots.footer" class="mt-4 flex justify-end gap-2">
              <slot name="footer" />
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.popframe-fade-enter-active,
.popframe-fade-leave-active {
  transition: opacity 0.16s ease-out;
}

.popframe-fade-enter-from,
.popframe-fade-leave-to {
  opacity: 0;
}

.popframe-scale-enter-active,
.popframe-scale-leave-active {
  transition:
    transform 0.18s ease-out,
    opacity 0.18s ease-out;
}

.popframe-scale-enter-from,
.popframe-scale-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(4px);
}
</style>
