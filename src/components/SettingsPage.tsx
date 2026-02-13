import { useState, useEffect, useCallback } from 'react'
import tripData from '../data/trip-data.json'

interface SettingsPageProps {
  onClose: () => void
}

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const [cacheStatus, setCacheStatus] = useState<'idle' | 'downloading' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [downloadedMB, setDownloadedMB] = useState(0)
  const [totalMB, setTotalMB] = useState(0)
  const [cacheSize, setCacheSize] = useState<string | null>(null)
  const [pmtilesCached, setPmtilesCached] = useState(false)
  const [showRoute, setShowRoute] = useState(() => {
    return localStorage.getItem('chile-show-route') !== 'false'
  })

  // Check cache size and PMTiles cache status on mount
  useEffect(() => {
    checkCacheSize()
    checkPmtilesCache()
  }, [])

  const checkCacheSize = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        const usedMB = Math.round((estimate.usage || 0) / (1024 * 1024))
        setCacheSize(`${usedMB} MB`)
      }
    } catch {
      setCacheSize(null)
    }
  }

  const checkPmtilesCache = async () => {
    try {
      const cache = await caches.open('pmtiles-offline-v1')
      const keys = await cache.keys()
      setPmtilesCached(keys.some(req => req.url.includes('chile-route.pmtiles')))
    } catch {
      setPmtilesCached(false)
    }
  }

  const cacheOfflineMap = useCallback(async () => {
    if (!('caches' in window)) {
      alert('Cache API nicht verfügbar. Bitte nutze einen modernen Browser.')
      return
    }

    setCacheStatus('downloading')
    setProgress(0)
    setDownloadedMB(0)
    setTotalMB(0)

    try {
      const pmtilesUrl = import.meta.env.BASE_URL + 'chile-route.pmtiles'
      
      // First, get the file size with a HEAD request
      let fileSizeBytes = 0
      try {
        const headResp = await fetch(pmtilesUrl, { method: 'HEAD' })
        const contentLength = headResp.headers.get('content-length')
        if (contentLength) {
          fileSizeBytes = parseInt(contentLength)
          setTotalMB(Math.round(fileSizeBytes / (1024 * 1024)))
        }
      } catch {
        // HEAD might not work, continue anyway
      }

      // Fetch the full PMTiles file with progress tracking
      const response = await fetch(pmtilesUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      // If we didn't get size from HEAD, try content-length from GET
      if (!fileSizeBytes) {
        const contentLength = response.headers.get('content-length')
        if (contentLength) {
          fileSizeBytes = parseInt(contentLength)
          setTotalMB(Math.round(fileSizeBytes / (1024 * 1024)))
        }
      }

      // Read the response as a stream to track progress
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('ReadableStream not supported')
      }

      const chunks: Uint8Array[] = []
      let receivedBytes = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        chunks.push(value)
        receivedBytes += value.length
        
        const mb = Math.round(receivedBytes / (1024 * 1024))
        setDownloadedMB(mb)
        
        if (fileSizeBytes > 0) {
          setProgress(Math.round((receivedBytes / fileSizeBytes) * 100))
        }
      }

      // Combine chunks into a single blob
      const blob = new Blob(chunks, { type: 'application/octet-stream' })
      const cacheResponse = new Response(blob, {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': String(receivedBytes),
        }
      })

      // Store in Cache API
      const cache = await caches.open('pmtiles-offline-v1')
      await cache.put(pmtilesUrl, cacheResponse)

      setCacheStatus('done')
      setPmtilesCached(true)
      setProgress(100)
      await checkCacheSize()
    } catch (err) {
      console.error('[PMTiles Cache] Error:', err)
      setCacheStatus('error')
    }
  }, [])

  const clearCache = useCallback(async () => {
    if (!confirm('Alle gecachten Kartendaten löschen?')) return
    
    try {
      await caches.delete('pmtiles-offline-v1')
      // Also clear old mapbox caches if they exist
      await caches.delete('mapbox-tiles-v1')
      await caches.delete('mapbox-tiles')
      
      setCacheStatus('idle')
      setProgress(0)
      setDownloadedMB(0)
      setPmtilesCached(false)
      await checkCacheSize()
      alert('✅ Cache gelöscht')
    } catch (err) {
      console.error('Cache clear error:', err)
      alert('Fehler beim Löschen')
    }
  }, [])

  const toggleRoute = () => {
    const newVal = !showRoute
    setShowRoute(newVal)
    localStorage.setItem('chile-show-route', newVal.toString())
    // Dispatch custom event so Map component can react
    window.dispatchEvent(new CustomEvent('chile-settings-change', { 
      detail: { showRoute: newVal } 
    }))
  }

  return (
    <div className="absolute inset-0 z-[700] flex flex-col bg-chile-bg-primary">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/10 bg-chile-bg-card/95 backdrop-blur-sm flex items-center gap-3"
           style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-lg">⚙️ Einstellungen</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        
        {/* Offline Map Section */}
        <section className="p-4 rounded-xl bg-white/5 border border-white/5">
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
            <span>🗺️</span> Karte offline speichern
          </h2>
          
          <div className="text-xs text-chile-text-secondary mb-3">
            Lädt die gesamte Vektorkarte (Chile-Route) herunter. 
            Damit funktioniert die Karte auch ohne Internet — inklusive aller Straßennamen und Details.
          </div>

          {pmtilesCached && cacheStatus !== 'downloading' && (
            <div className="mb-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400 flex items-center gap-2">
              <span>✅</span> Karte ist offline verfügbar!
            </div>
          )}

          {/* Progress Bar */}
          {cacheStatus === 'downloading' && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-chile-text-muted mb-1">
                <span>Herunterladen...</span>
                <span>
                  {downloadedMB} MB{totalMB > 0 ? ` / ${totalMB} MB` : ''} 
                  {progress > 0 ? ` (${progress}%)` : ''}
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-chile-accent-teal rounded-full transition-all duration-300"
                  style={{ width: progress > 0 ? `${progress}%` : '10%' }}
                />
              </div>
              <div className="text-[10px] text-chile-text-muted mt-1">
                ⚠️ Bitte die App nicht schließen. Die Datei ist groß — das kann einige Minuten dauern.
              </div>
            </div>
          )}

          {cacheStatus === 'done' && (
            <div className="mb-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400 flex items-center gap-2">
              <span>✅</span> Karte gespeichert! Offline verfügbar.
            </div>
          )}

          {cacheStatus === 'error' && (
            <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
              <span>❌</span> Fehler beim Herunterladen. Bitte erneut versuchen.
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={cacheOfflineMap}
              disabled={cacheStatus === 'downloading'}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                cacheStatus === 'downloading' 
                  ? 'bg-chile-accent-teal/30 text-chile-accent-teal cursor-not-allowed'
                  : 'bg-chile-accent-teal text-white hover:bg-chile-accent-teal/80'
              }`}
            >
              <span>{cacheStatus === 'downloading' ? '⏳' : '🗺️'}</span>
              {cacheStatus === 'downloading' ? 'Lädt...' : pmtilesCached ? 'Erneut laden' : 'Karte offline speichern'}
            </button>
          </div>
        </section>

        {/* Cache Management */}
        <section className="p-4 rounded-xl bg-white/5 border border-white/5">
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
            <span>💾</span> Speicher
          </h2>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-chile-text-secondary">
              Aktueller Cache-Verbrauch
            </div>
            <div className="text-xs font-medium text-chile-accent-teal">
              {cacheSize || 'Unbekannt'}
            </div>
          </div>
          <button
            onClick={clearCache}
            className="w-full py-2.5 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>🗑️</span> Cache leeren
          </button>
        </section>

        {/* Display Settings */}
        <section className="p-4 rounded-xl bg-white/5 border border-white/5">
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
            <span>🎨</span> Anzeige
          </h2>

          {/* Route Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm">Routenlinie anzeigen</div>
              <div className="text-[10px] text-chile-text-muted">Gestrichelte Linie zwischen Stopps</div>
            </div>
            <button
              onClick={toggleRoute}
              className={`w-12 h-6 rounded-full transition-all relative ${
                showRoute ? 'bg-chile-accent-teal' : 'bg-white/20'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                showRoute ? 'left-6' : 'left-0.5'
              }`} />
            </button>
          </div>
        </section>

        {/* App Info */}
        <section className="p-4 rounded-xl bg-white/5 border border-white/5">
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
            <span>ℹ️</span> App Info
          </h2>
          <div className="space-y-1.5 text-xs text-chile-text-secondary">
            <div className="flex justify-between">
              <span>Version</span><span className="text-chile-text-muted">2.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Reiseziele</span><span className="text-chile-text-muted">{tripData.locations.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Empfehlungen</span>
              <span className="text-chile-text-muted">
                {tripData.locations.reduce((acc: number, loc: { recommendations: unknown[] }) => acc + loc.recommendations.length, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Reisedauer</span><span className="text-chile-text-muted">{tripData.trip.totalDays} Tage</span>
            </div>
            <div className="flex justify-between">
              <span>Karte</span><span className="text-chile-text-muted">OpenStreetMap (Vektor, Offline)</span>
            </div>
          </div>
        </section>

        <div className="text-xs text-chile-text-muted text-center pb-4">
          Made with ❤️ for our Chile adventure
        </div>
      </div>
    </div>
  )
}
