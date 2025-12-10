import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hachimi.knowlesail',
  appName: 'Knowlesail',
  webDir: 'dist',
  server: {
    androidScheme: 'http'
  },
};

export default config;