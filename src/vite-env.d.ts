/// <reference types="vite/client" />

// PWA virtual module
declare module 'virtual:pwa-register' {
  export function registerSW(options?: {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: Error) => void
  }): (reloadPage?: boolean) => Promise<void>
}

// Image imports from Leaflet
declare module 'leaflet/dist/images/marker-icon.png' {
  const src: string
  export default src
}
declare module 'leaflet/dist/images/marker-shadow.png' {
  const src: string
  export default src
}
declare module 'leaflet/dist/images/marker-icon-2x.png' {
  const src: string
  export default src
}
