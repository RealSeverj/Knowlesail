import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

// 根据当前主题同步原生状态栏样式与背景
export async function applyStatusBarTheme(themeConfig) {
  if (!Capacitor.isNativePlatform()) return
  if (!themeConfig) return

  const isDark = themeConfig.mode === 'dark'

  try {
    await StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light
    })

    await StatusBar.setOverlaysWebView({ overlay: false })

  } catch (e) {
    console.warn('[status-bar] failed to apply status bar theme', e)
  }
}
