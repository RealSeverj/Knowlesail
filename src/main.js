import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Varlet from '@varlet/ui'
import '@vant/touch-emulator'
import '@varlet/ui/es/style'
import '@varlet/icons'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Varlet)

app.mount('#app')
