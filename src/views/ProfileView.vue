<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import UserInfo from '@/components/Profile/UserInfo.vue'
import SettingsList from '@/components/Profile/SettingsList.vue'
import DataDisplay from '@/components/Profile/DataDisplay.vue'
import ThemeSwitch from '@/components/Profile/ThemeSwitch.vue'
import PopFrame from '@/components/Common/PopFrame.vue'

const router = useRouter()
const profileStore = useProfileStore()

// 控制自定义主题弹窗显示
const showCustomThemeDialog = ref(false)

const goToProfileEdit = () => {
  router.push({ name: 'ProfileEdit' })
}

const goToPreferenceSettings = () => {
  router.push({ name: 'PreferenceSettings' })
}

const goToAbout = () => {
  router.push({ name: 'About' })
}

// 打开弹窗
const openCustomTheme = () => {
  showCustomThemeDialog.value = true
}

// 关闭弹窗
const closeCustomTheme = () => {
  showCustomThemeDialog.value = false
}
</script>

<template>
  <div
    class="profile-view px-4 pb-4 pt-4"
  >
    <div class="mx-auto flex max-w-screen-sm flex-col gap-4">
      <!-- 顶部用户信息 -->
      <section class="rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-slate-800/80">
        <UserInfo
          :user="profileStore.user"
          :masked-phone="profileStore.maskedPhone"
          @edit="goToProfileEdit"
        />
      </section>

      <!-- 学习数据统计 -->
      <DataDisplay :stats="profileStore.stats" />

      <!-- 设置列表 -->
      <section class="rounded-2xl bg-white/80 p-3 shadow-sm backdrop-blur dark:bg-slate-800/80">
        <SettingsList
          :preferences="profileStore.preferences"
          @open-preference="goToPreferenceSettings"
          @open-about="goToAbout"
          @open-custom-theme="openCustomTheme"
        />
      </section>

      <!-- 自定义主题弹窗（居中，自定义 PopFrame） -->
      <PopFrame
        v-model:show="showCustomThemeDialog"
        :overlay="true"
        :close-on-click-overlay="true"
        width-class="w-[88vw] max-w-sm"
        max-height-class="max-h-[70vh]"
      >
        <template #header>
          <h2 class="text-base font-semibold text-slate-800 dark:text-slate-100">自定义主题</h2>
        </template>

        <ThemeSwitch />
      </PopFrame>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'SF Pro Text',
    'Segoe UI',
    sans-serif;
  height: 100%;
  overflow-y: auto;
}
</style>
