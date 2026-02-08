import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'

// Register service worker with auto-update and visible reload prompt
const updateSW = registerSW({
  onNeedRefresh() {
    // Show update banner
    const banner = document.createElement('div')
    banner.id = 'sw-update-banner'
    banner.innerHTML = `
      <div style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999;
        background:#22c55e;color:#000;padding:12px 20px;border-radius:12px;font-weight:600;
        font-size:14px;display:flex;align-items:center;gap:12px;box-shadow:0 4px 20px rgba(0,0,0,0.5);
        font-family:system-ui,sans-serif;">
        <span>🔄 Neues Update verfügbar!</span>
        <button onclick="document.getElementById('sw-update-banner').remove();(${updateSW.toString()})();"
          style="background:#000;color:#22c55e;border:none;padding:6px 14px;border-radius:8px;
          font-weight:700;cursor:pointer;font-size:13px;">Jetzt aktualisieren</button>
      </div>
    `
    document.body.appendChild(banner)
  },
  onOfflineReady() {
    console.log('✅ App ready for offline use')
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
