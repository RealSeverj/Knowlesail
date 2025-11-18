<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:show', 'update:modelValue', 'close'])

const internalShow = computed({
  get() {
    return props.show
  },
  set(v) {
    emit('update:show', v)
  }
})

const date = ref('')
const time = ref('')

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      date.value = ''
      time.value = ''
      return
    }
    const d = new Date(val)
    if (Number.isNaN(d.getTime())) {
      date.value = ''
      time.value = ''
      return
    }
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    date.value = `${y}-${m}-${day}`
    time.value = `${hh}:${mm}`
  },
  { immediate: true }
)

watch(
  () => props.show,
  (visible) => {
    if (visible && !props.modelValue && !date.value) {
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      date.value = `${y}-${m}-${d}`
    }
  }
)

const handleClose = () => {
  internalShow.value = false
  emit('close')
}

const handleConfirm = () => {
  if (!date.value) {
    // 没选日期则视为不设置截止时间
    emit('update:modelValue', '')
    handleClose()
    return
  }
  const [y, m, d] = date.value.split('-').map((x) => Number(x))
  let h = 0
  let min = 0
  if (time.value) {
    const [hh, mm] = time.value.split(':').map((x) => Number(x))
    h = hh
    min = mm
  }
  const dt = new Date(y, m - 1, d, h, min, 0)
  if (Number.isNaN(dt.getTime())) {
    emit('update:modelValue', '')
  } else {
    emit('update:modelValue', dt.toISOString())
  }
  handleClose()
}

const handleCancel = () => {
  // 取消时清空已设置的截止时间
  emit('update:modelValue', '')
  handleClose()
}
</script>

<template>
  <var-popup
    v-model:show="internalShow"
    position="bottom"
    safe-area
    :overlay="true"
    :close-on-click-overlay="true"
    @click-overlay="handleClose"
  >
    <div class="max-h-[70vh] rounded-t-3xl bg-[var(--color-surface)] px-4 pb-5 pt-4">
      <header class="mb-3 flex items-center justify-between">
        <h2 class="text-base font-semibold text-[var(--color-text-primary)]">选择截止时间</h2>
        <button class="p-1 text-[var(--color-text-secondary)]" @click="handleClose">
          <var-icon name="close" :size="18" />
        </button>
      </header>

      <div class="space-y-3 text-sm">
        <div>
          <p class="mb-1 text-xs text-[var(--color-text-secondary)]">日期</p>
          <var-date-picker v-model="date" type="date" :readonly="false" />
        </div>
        <div>
          <p
            class="mb-1 text-xs text-[var(--color-text-secondary)] flex items-center justify-between"
          >
            <span>时间（可选）</span>
            <button
              class="text-[10px] text-[var(--color-text-secondary)] underline"
              @click="time = ''"
            >
              清除时间
            </button>
          </p>
          <var-time-picker v-model="time" format="24hr" />
        </div>
      </div>

      <div class="mt-4 flex gap-3 pb-5">
        <var-button block text @click="handleCancel"> 取消 </var-button>
        <var-button block type="primary" @click="handleConfirm"> 完成 </var-button>
      </div>
    </div>
  </var-popup>
</template>
