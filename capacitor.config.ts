import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.govardhan.dairyapp',
  appName: 'govardhan',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '195477983983-j6t5p8e2djnkijstpcfael4sshi64lk2.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
