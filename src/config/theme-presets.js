export const THEME_STORAGE_KEY = 'app-theme-v2'

export const presetThemes = [
  {
    id: 'light-default',
    name: '默认浅色',
    mode: 'light',
    colors: {
      '--color-primary': '#3b82f6',
      '--color-primary-light': '#60a5fa',
      '--color-primary-dark': '#2563eb',
      '--color-background': '#ffffff',
      '--color-surface': '#f9fafb',
      '--color-surface-variant': '#f3f4f6',
      '--color-border-subtle': '#e5e7eb',
      '--color-text-main': '#0f172a',
      '--color-text-secondary': '#6b7280'
    },
    backgroundImage: '',
    bgOpacity: 1,
    bgBlur: '0px'
  },
  {
    id: 'dark-default',
    name: '默认深色',
    mode: 'dark',
    colors: {
      '--color-primary': '#60a5fa',
      '--color-primary-light': '#93c5fd',
      '--color-primary-dark': '#3b82f6',
      '--color-background': '#020617',
      '--color-surface': '#191b25ff',
      '--color-surface-variant': '#020617',
      '--color-border-subtle': '#1e293b',
      '--color-text-main': '#e5e7eb',
      '--color-text-secondary': '#9ca3af'
    },
    backgroundImage: '',
    bgOpacity: 0.6,
    bgBlur: '10px'
  },
  {
    id: 'ocean-blue',
    name: '海洋蓝',
    mode: 'light',
    colors: {
      '--color-primary': '#0284c7',
      '--color-primary-light': '#38bdf8',
      '--color-primary-dark': '#0369a1',
      '--color-background': '#e0f2fe',
      '--color-surface': '#f0f9ff',
      '--color-surface-variant': '#dbeafe',
      '--color-border-subtle': '#bfdbfe',
      '--color-text-main': '#0f172a',
      '--color-text-secondary': '#475569'
    },
    backgroundImage: 'url(/images/bg-ocean.jpg)',
    bgOpacity: 0.30,
    bgBlur: '4px'
  }
]

export const defaultCustomTheme = {
  id: 'custom',
  name: '自定义主题',
  mode: 'light',
  colors: {
    '--color-primary': '#3b82f6',
    '--color-background': '#ffffff',
    '--color-surface': '#f9fafb',
    '--color-surface-variant': '#f3f4f6',
    '--color-border-subtle': '#e5e7eb',
    '--color-text-main': '#0f172a',
    '--color-text-secondary': '#6b7280'
  },
  backgroundImage: '',
  bgOpacity: 1,
  bgBlur: '0px'
}
