import { ref, watch } from 'vue'
import { presetThemes, defaultCustomTheme, THEME_STORAGE_KEY } from '@/config/theme-presets'

const LEGACY_THEME_KEY = 'app-theme'

const theme = ref(null)

function loadThemeFromStorage() {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    console.warn('[theme] failed to parse theme from storage', e)
    return null
  }
}

function saveThemeToStorage(state) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('[theme] failed to save theme to storage', e)
  }
}

function findPresetById(id) {
  return presetThemes.find((t) => t.id === id) || null
}

const applyTheme = (themeConfig) => {
  if (!themeConfig) return

  const { mode, colors, backgroundImage, bgOpacity, bgBlur } = themeConfig
  const root = document.documentElement

  // data-theme 仍然只认 light/dark，兼容原有逻辑和 Tailwind darkMode 配置
  const themeMode = mode === 'dark' ? 'dark' : 'light'
  root.setAttribute('data-theme', themeMode)
  root.dataset.themeVariant = themeMode

  // 写入颜色变量
  if (colors && typeof colors === 'object') {
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }

  // 背景图片变量 + 是否有背景图开关
  if (backgroundImage) {
    root.style.setProperty('--app-bg-image', backgroundImage)
    root.style.setProperty('--app-has-bg-image', '1')
  } else {
    root.style.removeProperty('--app-bg-image')
    root.style.setProperty('--app-has-bg-image', '0')
  }

  // 背景效果变量（透明度与模糊度）
  if (typeof bgOpacity !== 'undefined') {
    root.style.setProperty('--app-bg-opacity', String(bgOpacity))
  } else {
    root.style.removeProperty('--app-bg-opacity')
  }

  if (typeof bgBlur !== 'undefined') {
    root.style.setProperty('--app-bg-blur', String(bgBlur))
  } else {
    root.style.removeProperty('--app-bg-blur')
  }

  // 持久化
  const stateToSave = {
    currentThemeId: themeConfig.id,
    customTheme: themeConfig.id === 'custom' ? { ...themeConfig } : null
  }
  saveThemeToStorage(stateToSave)
}

const initTheme = () => {
  if (theme.value) {
    // 已经初始化过，避免重复从 storage 读
    applyTheme(theme.value)
    return
  }

  const saved = loadThemeFromStorage()

  if (saved?.currentThemeId) {
    if (saved.currentThemeId === 'custom' && saved.customTheme) {
      theme.value = saved.customTheme
    } else {
      theme.value = findPresetById(saved.currentThemeId) || presetThemes[0]
    }
  } else {
    // 兼容旧版本：从 app-theme 读取 light/dark
    const legacy = localStorage.getItem(LEGACY_THEME_KEY)
    if (legacy === 'dark') {
      theme.value = findPresetById('dark-default') || presetThemes[1] || presetThemes[0]
    } else {
      theme.value = findPresetById('light-default') || presetThemes[0]
    }
  }

  applyTheme(theme.value)
}

// 简单明暗切换：在预设主题中寻找对应 mode 的主题
const toggleTheme = () => {
  const currentMode = theme.value?.mode === 'dark' ? 'dark' : 'light'
  const targetMode = currentMode === 'light' ? 'dark' : 'light'

  const fallback =
    presetThemes.find((t) => t.mode === targetMode) ||
    (targetMode === 'dark' ? presetThemes[1] : presetThemes[0]) ||
    presetThemes[0]

  theme.value = fallback
  applyTheme(theme.value)
}

// 选择预设主题
const setTheme = (newTheme) => {
  // 兼容旧 API: 'light' / 'dark'
  if (newTheme === 'light') {
    const light = findPresetById('light-default') || presetThemes.find((t) => t.mode === 'light')
    if (!light) return
    theme.value = light
    applyTheme(light)
    return
  }

  if (newTheme === 'dark') {
    const dark = findPresetById('dark-default') || presetThemes.find((t) => t.mode === 'dark')
    if (!dark) return
    theme.value = dark
    applyTheme(dark)
    return
  }

  const preset = findPresetById(newTheme)
  if (!preset) return

  theme.value = preset
  applyTheme(preset)
}

// 更新自定义主题（颜色 / 背景图等）
const updateCustomTheme = (patch) => {
  const base =
    theme.value?.id === 'custom'
      ? theme.value
      : {
          ...defaultCustomTheme
        }

  const merged = {
    ...base,
    ...patch,
    colors: {
      ...base.colors,
      ...(patch.colors || {})
    },
    id: 'custom'
  }

  theme.value = merged
  applyTheme(merged)
}

// 保持与旧实现类似的自动响应特性
watch(
  theme,
  (newTheme) => {
    if (newTheme) applyTheme(newTheme)
  },
  { deep: true }
)

export function useTheme() {
  return {
    theme,
    initTheme,
    toggleTheme,
    setTheme,
    updateCustomTheme
  }
}