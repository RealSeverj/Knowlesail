import { SafeArea, SystemBarsStyle, SystemBarsType } from '@capacitor-community/safe-area'
import { Capacitor } from '@capacitor/core'

// 根据当前主题同步原生状态栏样式与背景
export async function applyStatusBarTheme(themeConfig) {
  if (!Capacitor.isNativePlatform()) return
  if (!themeConfig) return

  const isDark = themeConfig.mode === 'dark'

  try {
    await SafeArea.setSystemBarsStyle({
      style: isDark ? SystemBarsStyle.Dark : SystemBarsStyle.Light,
      type: SystemBarsType.StatusBar
    })
  } catch (e) {
    console.warn('[status-bar] failed to apply status bar theme', e)
  }
}
