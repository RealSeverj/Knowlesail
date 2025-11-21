import { onMounted, onBeforeUnmount } from 'vue'
import { registerBackInterceptor, unregisterBackInterceptor } from './useBackButtonHandler'

export function usePopupBackClose(isOpenRef, closeFn) {
  const interceptor = () => {
    if (isOpenRef.value) {
      closeFn()
      return true
    }
    return false
  }

  onMounted(() => {
    registerBackInterceptor(interceptor)
  })

  onBeforeUnmount(() => {
    unregisterBackInterceptor(interceptor)
  })
}
