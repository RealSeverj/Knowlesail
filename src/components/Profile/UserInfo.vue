<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  maskedPhone: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['edit'])
</script>

<template>
  <!-- 头像区 -->
  <div class="w-full flex flex-col items-center gap-3 py-4">
    <div class="relative">
      <div
        class="w-20 h-20 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm dark:bg-slate-700 dark:border-slate-600"
      >
        <var-icon name="account-circle" :size="64" color="var(--color-primary)" />
      </div>
      <button
        aria-label="编辑资料"
        class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:scale-105 transition-transform duration-150 dark:bg-slate-700 dark:border-slate-600"
        @click="emit('edit')"
      >
        <img src="@/assets/icons/account-box-edit-outline.svg" alt="编辑" class="w-4 h-4" />
      </button>
    </div>

    <!-- 名称与学号 -->
    <div class="text-center">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-50 m-0">
        {{ props.user.nickname }}
      </h2>
      <p class="text-xs text-slate-500 dark:text-slate-400 m-0">学号 {{ props.user.studentId }}</p>
    </div>

    <!-- 签名 -->
    <div class="text-center">
      <p
        class="text-sm text-slate-600 dark:text-slate-300 m-0 leading-relaxed line-clamp-3 break-words italic"
      >
        {{ props.user.signature || '这个同学还没有写签名～' }}
      </p>
    </div>

    <!-- 详细信息卡片 (DataDisplay 风格，无图标) -->
    <div class="w-full mt-4">
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-xl bg-slate-50 p-3 dark:bg-slate-700/60">
          <div class="text-xs text-slate-500 dark:text-slate-400">真实姓名</div>
          <div class="text-sm font-semi text-slate-900 dark:text-slate-50">
            {{ props.user.realName || '-' }}
          </div>
        </div>

        <div class="rounded-xl bg-slate-50 p-3 dark:bg-slate-700/60">
          <div class="text-xs text-slate-500 dark:text-slate-400">学院</div>
          <div class="text-sm font-semi text-slate-900 dark:text-slate-50">
            {{ props.user.academy || '-' }}
          </div>
        </div>

        <div class="rounded-xl bg-slate-50 p-3 dark:bg-slate-700/60">
          <div class="text-xs text-slate-500 dark:text-slate-400">专业</div>
          <div class="text-sm font-semi text-slate-900 dark:text-slate-50">
            {{ props.user.major || '-' }}
          </div>
        </div>

        <div class="rounded-xl bg-slate-50 p-3 dark:bg-slate-700/60">
          <div class="text-xs text-slate-500 dark:text-slate-400">年级</div>
          <div class="text-sm font-semi text-slate-900 dark:text-slate-50">
            {{ props.user.grade || '-' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
