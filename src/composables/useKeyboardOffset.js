import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useKeyboardOffset() {
  const keyboardOffset = ref(0)
  let showListener
  let hideListener
  let viewportListener

  onMounted(async () => {
    // 优先尝试使用 Capacitor Keyboard（原生移动端）
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
      // Keyboard 插件不可用或加载失败，自动降级
      console.warn('Keyboard plugin not available, using visualViewport API:', e.message)
    }

    // 如果 Keyboard 初始化失败，降级使用 visualViewport API（Web 环境）
    if (!keyboardInitialized && window.visualViewport) {
      const handleViewportChange = () => {
        const keyboardHeight = Math.max(0, window.innerHeight - window.visualViewport.height)
        keyboardOffset.value = keyboardHeight
      }

      window.visualViewport.addEventListener('resize', handleViewportChange)
      window.visualViewport.addEventListener('scroll', handleViewportChange)

      // 保存清理函数供卸载时使用
      viewportListener = () => {
        window.visualViewport.removeEventListener('resize', handleViewportChange)
        window.visualViewport.removeEventListener('scroll', handleViewportChange)
      }
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
    // 清理 visualViewport 监听器
    if (viewportListener && typeof viewportListener === 'function') {
      viewportListener()
    }
  })

  return {
    keyboardOffset
  }
}
