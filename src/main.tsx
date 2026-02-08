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
    Object.assign(banner.style, {
      position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
      zIndex: '99999', background: '#22c55e', color: '#000', padding: '12px 20px',
      borderRadius: '12px', fontWeight: '600', fontSize: '14px', display: 'flex',
      alignItems: 'center', gap: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      fontFamily: 'system-ui, sans-serif', maxWidth: '90vw',
    })
    
    const text = document.createElement('span')
    text.textContent = '🔄 Neues Update verfügbar!'
    
    const btn = document.createElement('button')
    btn.textContent = 'Aktualisieren'
    Object.assign(btn.style, {
      background: '#000', color: '#22c55e', border: 'none', padding: '6px 14px',
      borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px',
      whiteSpace: 'nowrap',
    })
    btn.onclick = () => {
      banner.remove()
      updateSW(true)
    }
    
    banner.appendChild(text)
    banner.appendChild(btn)
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
