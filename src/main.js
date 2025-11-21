import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Varlet from '@varlet/ui'
import '@vant/touch-emulator'
import '@varlet/ui/es/style'
import '@varlet/icons'
import './style.css'
import App from './App.vue'
import router from './router'
import { App as CapacitorApp } from '@capacitor/app'
import { useToast } from './composables/useToast'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Varlet)

app.mount('#app')

// 监听返回键事件
let backPressedOnce = false
const toast = useToast()
CapacitorApp.addListener('backButton', ({ canGoBack }) => {
  if (canGoBack) {
    router.back()
  } else {
    if (backPressedOnce) {
      CapacitorApp.exitApp()
    } else {
      backPressedOnce = true
      toast.info('再按一次返回键退出应用')
      setTimeout(() => {
        backPressedOnce = false
      }, 2000)
    }
  }
})
