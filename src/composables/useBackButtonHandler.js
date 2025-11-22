import { App } from '@capacitor/app'
import { onMounted, onBeforeUnmount } from 'vue'
import router from '../router'
import { useToast } from './useToast'

// 支持多个返回键拦截器，后注册的优先
const backInterceptors = []

export function registerBackInterceptor(fn) {
  if (typeof fn === 'function' && !backInterceptors.includes(fn)) {
    backInterceptors.push(fn)
  }
}

export function unregisterBackInterceptor(fn) {
  const idx = backInterceptors.indexOf(fn)
  if (idx !== -1) {
    backInterceptors.splice(idx, 1)
  }
}

export function useBackButtonHandler(options = {}) {
  const {
    mainRouteNames = ['Home', 'Todo', 'Knowledge', 'Curriculum', 'Profile'],
    exitToastMessage = '再按一次返回键退出应用',
    exitTimeout = 1000,
  } = options

  let backPressedOnce = false
  const toast = useToast()
  let removeListener

  const handleBack = ({ canGoBack }) => {
    // 1. 依次询问拦截器（后注册的先执行）
    for (let i = backInterceptors.length - 1; i >= 0; i -= 1) {
      const interceptor = backInterceptors[i]
      if (typeof interceptor === 'function') {
        const handled = interceptor()
        if (handled) {
          return
        }
      }
    }

    // 2. 再处理路由返回 / 退出应用
    const current = router.currentRoute.value
    const isOnMainRoute =
      current && mainRouteNames.includes(current.name)

    if (!isOnMainRoute && canGoBack) {
      router.back()
      return
    }

    if (backPressedOnce) {
      App.exitApp()
    } else {
      backPressedOnce = true
      toast.info(exitToastMessage)
      setTimeout(() => {
        backPressedOnce = false
      }, exitTimeout)
    }
  }

  onMounted(() => {
    removeListener = App.addListener('backButton', handleBack)
  })

  onBeforeUnmount(() => {
    if (removeListener && typeof removeListener.remove === 'function') {
      removeListener.remove()
    }
  })
}