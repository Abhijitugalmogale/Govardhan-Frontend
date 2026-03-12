import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import './locales/i18n';

import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';

// Initialize the Capacitor Google Auth plugin (only on native platforms)
if (Capacitor.isNativePlatform()) {
  GoogleAuth.initialize({
    clientId: '195477983983-j6t5p8e2djnkijstpcfael4sshi64lk2.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    grantOfflineAccess: true,
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
