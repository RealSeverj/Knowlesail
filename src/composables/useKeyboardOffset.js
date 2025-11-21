import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Keyboard } from '@capacitor/keyboard'

const keyboardOffset = ref(0)
let showListener
let hideListener

export function useKeyboardOffset() {
  onMounted(() => {
    // 某些平台可能没有 Keyboard 插件，做个保护
    if (!Keyboard || !Keyboard.addListener) return

    showListener = Keyboard.addListener('keyboardWillShow', (info) => {
      keyboardOffset.value = info.keyboardHeight || 0
    })

    hideListener = Keyboard.addListener('keyboardWillHide', () => {
      keyboardOffset.value = 0
    })
  })

  onBeforeUnmount(() => {
    showListener && showListener.remove()
    hideListener && hideListener.remove()
  })

  return {
    keyboardOffset,
  }
}