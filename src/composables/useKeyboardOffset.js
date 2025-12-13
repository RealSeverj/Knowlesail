import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Capacitor } from '@capacitor/core'

const keyboardOffset = ref(0)
let showListener = null
let hideListener = null

export function useKeyboardOffset() {
  if (!Capacitor.isNativePlatform()) {
    console.warn('[notification] 当前在浏览器环境，无法使用键盘高度监听')
    return keyboardOffset
  }

  onMounted(async () => {
    let keyboardInitialized = false

    try {
      const { Keyboard } = await import('@capacitor/keyboard')
      if (Keyboard && Keyboard.addListener) {
        showListener = Keyboard.addListener('keyboardWillShow', (info) => {
          keyboardOffset.value = info.keyboardHeight || 0
        })
        hideListener = Keyboard.addListener('keyboardWillHide', () => {
          keyboardOffset.value = 0
        })
        keyboardInitialized = true
      }
    } catch (e) {
      console.warn('Keyboard plugin not available', e.message)
      return keyboardOffset
    }
  })

  onBeforeUnmount(() => {
    // 清理 Capacitor Keyboard 监听器
    if (showListener && typeof showListener.remove === 'function') {
      showListener.remove()
    }
    if (hideListener && typeof hideListener.remove === 'function') {
      hideListener.remove()
    }
  })

  return keyboardOffset
}
