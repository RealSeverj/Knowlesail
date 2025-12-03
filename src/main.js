import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Varlet from '@varlet/ui'
import '@vant/touch-emulator'
import '@varlet/ui/es/style'
import '@varlet/icons'
import './style.css'
import App from './App.vue'
import router, { setupRouterGuards } from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Varlet)

// 在 pinia 安装后设置路由守卫，确保 store 可用
setupRouterGuards(router)

app.mount('#app')
