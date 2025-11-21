import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

export async function applyStatusBarTheme(themeConfig) {
  if (!Capacitor.isNativePlatform()) return
  if (!themeConfig) return

  const isDark = themeConfig.mode === 'dark'
  try {
    await StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light
    })
  } catch (e) {
    console.warn('[status-bar] failed to apply status bar theme', e)
  }
}
