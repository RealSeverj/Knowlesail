import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.hachimi.knowlesail',
  appName: 'Knowlesail',
  webDir: 'dist',
  server: {
    androidScheme: 'http'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true
    },
    Keyboard: {
      resizeOnFullScreen: false
    }
  }
}

export default config
