<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { setItem, getItem } from '@/utils/storage'

const router = useRouter()
const toast = useToast()
const { confirm } = useConfirm()

// 偏好设置数据
const preferences = ref({
  defaultPage: getItem('pref_default_page', 'Knowledge')
})

// 保存原始数据用于对比
const originalPreferences = ref({
  defaultPage: getItem('pref_default_page', 'Knowledge')
})

// 页面选项
const pageOptions = [
  { name: 'Curriculum', label: '课程表', icon: 'calendar-month' },
  { name: 'Todo', label: '待办事项', icon: 'checkbox-marked-circle-outline' },
  { name: 'Home', label: '智能助手', icon: 'chat-processing' },
  { name: 'Knowledge', label: '知识库', icon: 'notebook' },
  { name: 'Profile', label: '个人中心', icon: 'account-circle' }
]

// 检测是否有未保存的改动
const hasChanges = computed(() => {
  return preferences.value.defaultPage !== originalPreferences.value.defaultPage
})

// 保存偏好设置
const savePreferences = async () => {
  if (!hasChanges.value) {
    toast.success('偏好设置已保存')
    return
  }

  setItem('pref_default_page', preferences.value.defaultPage)
  originalPreferences.value.defaultPage = preferences.value.defaultPage
  toast.success('偏好设置已保存')
}

// 重置为默认设置
const resetToDefaults = async () => {
  if (preferences.value.defaultPage === 'Home' && !hasChanges.value) {
    toast.success('已经是默认设置')
    return
  }

  const isConfirmed = await confirm('确定要重置为默认设置吗？', {
    title: '重置为默认',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })

  if (isConfirmed) {
    preferences.value = {
      defaultPage: 'Home'
    }
    await savePreferences()
  }
}

// 返回上一页
const goBack = async () => {
  if (hasChanges.value) {
    const isConfirmed = await confirm('您有未保存的改动，确定要返回吗？', {
      title: '未保存的改动',
      confirmButtonText: '返回',
      cancelButtonText: '留下'
    })
    if (!isConfirmed) return
  }
  router.back()
}
</script>

<template>
  <div class="preference-settings-page w-full h-screen flex flex-col bg-background">
    <!-- 内容区域 -->
    <div class="flex-1 overflow-y-auto p-4 pb-28">
      <!-- 页面标题 -->
      <div class="sticky top-0 z-10 bg-background mb-8 pt-4 -mx-4 px-4">
        <div class="flex items-center gap-3 mb-3">
          <var-button
            type="text"
            size="small"
            class="!p-0 !h-auto min-w-auto !border-0 !shadow-none"
            @click="goBack"
          >
            <var-icon name="chevron-left" :size="24" />
          </var-button>
          <div class="flex-1 flex flex-col items-center">
            <h1 class="text-2xl font-bold text-foreground">偏好设置</h1>
            <p class="text-secondary text-sm mt-1">个性化配置你的应用体验</p>
          </div>
          <div class="w-6"></div>
        </div>
      </div>

      <!-- 设置卡片容器 -->
      <div class="space-y-4 pb-8">
        <!-- 默认打开页面 -->
        <div class="bg-surface rounded-2xl p-5 shadow-card-soft">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <var-icon name="home-outline" :size="24" color="var(--color-primary)" />
              <div>
                <h3 class="text-base font-semibold text-foreground">默认打开页面</h3>
                <p class="text-xs text-secondary mt-1">应用启动时打开的页面</p>
              </div>
            </div>
          </div>

          <var-radio-group v-model="preferences.defaultPage">
            <var-radio
              v-for="option in pageOptions"
              :key="option.name"
              :checked-value="option.name"
            >
              <div class="flex items-center gap-2">
                <var-icon :name="option.icon" :size="20" />
                <span>{{ option.label }}</span>
              </div>
            </var-radio>
          </var-radio-group>
        </div>

        <!-- 更多设置提示 -->
        <div class="bg-primary/10 rounded-2xl p-4 border border-primary/20">
          <div class="flex gap-3">
            <var-icon
              name="information-outline"
              :size="20"
              color="var(--color-primary)"
              class="flex-shrink-0 mt-0.5"
            />
            <div class="text-sm text-foreground">
              <p class="font-semibold mb-1">小提示</p>
              <p class="text-secondary">你的偏好设置会自动保存到本地，跨设备需重新配置</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div
      class="fixed bottom-14 left-0 right-0 flex gap-3 p-4 bg-background border-t border-border/30"
      style="z-index: 10; padding-bottom: calc(1rem + env(safe-area-inset-bottom))"
    >
      <var-button class="flex-1" type="default" size="large" @click="resetToDefaults">
        重置为默认
      </var-button>
      <var-button class="flex-1" type="primary" size="large" @click="savePreferences">
        保存设置
      </var-button>
    </div>
  </div>
</template>

<style scoped>
.preference-settings-page {
  background-color: var(--color-background);
  overflow: auto;
}

:deep(.var-radio) {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

:deep(.var-radio:hover) {
  background-color: var(--color-surface-variant);
}

:deep(.var-radio__checked) {
  background-color: var(--color-primary);
}
</style>
