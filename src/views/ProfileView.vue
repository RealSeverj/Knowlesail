<script setup>
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import UserInfo from '@/components/Profile/UserInfo.vue'
import SettingsList from '@/components/Profile/SettingsList.vue'
import DataDisplay from '@/components/Profile/DataDisplay.vue'

const router = useRouter()
const profileStore = useProfileStore()

const goToProfileEdit = () => {
  router.push({ name: 'ProfileEdit' })
}

const goToPreferenceSettings = () => {
  router.push({ name: 'PreferenceSettings' })
}

const goToAbout = () => {
  router.push({ name: 'About' })
}
</script>

<template>
  <div class="profile-view min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 px-4 pb-16 pt-4">
    <div class="mx-auto flex max-w-screen-sm flex-col gap-4">
      <!-- 顶部用户信息 -->
      <section class="rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-slate-800/80">
        <UserInfo :user="profileStore.user" :masked-phone="profileStore.maskedPhone" @edit="goToProfileEdit" />
      </section>

      <!-- 学习数据统计 -->
      <DataDisplay :stats="profileStore.stats" />

      <!-- 设置列表 -->
      <section class="rounded-2xl bg-white/80 p-3 shadow-sm backdrop-blur dark:bg-slate-800/80">
        <SettingsList
          :preferences="profileStore.preferences"
          @open-preference="goToPreferenceSettings"
          @open-about="goToAbout"
        />
      </section>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
  height: 100vh;
  overflow-y: auto;
}
</style>
