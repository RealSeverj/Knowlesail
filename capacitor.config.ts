import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hachimi.knowlesail',
  appName: 'Knowlesail',
  webDir: 'dist',
  server: {
    // 对于打包后的应用，可以设置为 http scheme
    androidScheme: 'http'
  }
};

export default config;
