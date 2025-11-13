import { ref, watch } from 'vue'

const THEME_KEY = 'app-theme'

export function useTheme() {
  const theme = ref(localStorage.getItem(THEME_KEY) || 'light')

  const initTheme = () => {
    applyTheme(theme.value)
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    applyTheme(theme.value)
  }

  const setTheme = (newTheme) => {
    if (['light', 'dark'].includes(newTheme)) {
      theme.value = newTheme
      applyTheme(newTheme)
    }
  }

  const applyTheme = (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName)
    localStorage.setItem(THEME_KEY, themeName)
  }

  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })

  return {
    theme,
    initTheme,
    toggleTheme,
    setTheme
  }
}
