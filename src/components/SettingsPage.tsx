import { useState, useEffect, useCallback } from 'react'
import tripData from '../data/trip-data.json'

interface SettingsPageProps {
  onClose: () => void
}

// Convert lat/lon to tile x/y at given zoom
function lonLatToTile(lon: number, lat: number, zoom: number): [number, number] {
  const n = Math.pow(2, zoom)
  const x = Math.floor(((lon + 180) / 360) * n)
  const latRad = (lat * Math.PI) / 180
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
  return [x, y]
}

// Generate tile URLs for all locations
function generateTileUrls(
  locations: Array<{ coordinates: [number, number] }>,
  zoomLevels: number[],
  radiusTiles: number = 3
): string[] {
  const urls: string[] = []
  const seen = new Set<string>()
  const token = atob('cGsuZXlKMUlqb2liWE53WkROMklpd2lZU0k2SW1OdGJHTTNaalZ3Y2pCMk0zUXphM05uZEdsMmFIcDFiV1FpZlEuWnZaWWQ5UlRVczdUcmw0WFZ6RWRlQQ==')

  for (const loc of locations) {
    for (const zoom of zoomLevels) {
      const [cx, cy] = lonLatToTile(loc.coordinates[1], loc.coordinates[0], zoom)
      // Scale radius with zoom - at low zoom fewer tiles needed
      const r = Math.min(radiusTiles, Math.max(1, Math.floor(radiusTiles * (zoom - 7) / 7)))

      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          const x = cx + dx
          const y = cy + dy
          const key = `${zoom}/${x}/${y}`
          if (seen.has(key)) continue
          seen.add(key)
          urls.push(
            `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/${zoom}/${x}/${y}@2x?access_token=${token}`
          )
        }
      }
    }
  }
  return urls
}

// Estimate total tiles for display
function estimateTileCount(
  locationCount: number,
  zoomLevels: number[],
  radiusTiles: number = 3
): number {
  let total = 0
  for (const zoom of zoomLevels) {
    const r = Math.min(radiusTiles, Math.max(1, Math.floor(radiusTiles * (zoom - 7) / 7)))
    const side = 2 * r + 1
    total += locationCount * side * side
  }
  // Reduce for overlap
  return Math.floor(total * 0.75)
}

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const [cacheStatus, setCacheStatus] = useState<'idle' | 'downloading' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [totalTiles, setTotalTiles] = useState(0)
  const [downloadedTiles, setDownloadedTiles] = useState(0)
  const [cacheSize, setCacheSize] = useState<string | null>(null)
  const [showRoute, setShowRoute] = useState(() => {
    return localStorage.getItem('chile-show-route') !== 'false'
  })

  const ZOOM_LEVELS = [8, 9, 10, 11, 12, 13, 14]
  const estimatedTiles = estimateTileCount(tripData.locations.length, ZOOM_LEVELS)
  const estimatedSizeMB = Math.round(estimatedTiles * 25 / 1024) // ~25KB per @2x tile

  // Check cache size on mount
  useEffect(() => {
    checkCacheSize()
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

  const prefetchTiles = useCallback(async () => {
    if (!('caches' in window)) {
      alert('Cache API nicht verfügbar. Bitte nutze einen modernen Browser.')
      return
    }

    setCacheStatus('downloading')
    setProgress(0)
    setDownloadedTiles(0)

    try {
      const cache = await caches.open('mapbox-tiles-v1')
      const locations = tripData.locations.map(l => ({
        coordinates: l.coordinates as [number, number]
      }))
      const urls = generateTileUrls(locations, ZOOM_LEVELS)
      setTotalTiles(urls.length)

      let fetched = 0
      let errors = 0
      const BATCH_SIZE = 6
      
      for (let i = 0; i < urls.length; i += BATCH_SIZE) {
        const batch = urls.slice(i, i + BATCH_SIZE)
        const promises = batch.map(async (url) => {
          try {
            // Check if already cached
            const existing = await cache.match(url)
            if (existing) {
              fetched++
              return
            }
            const response = await fetch(url)
            if (response.ok) {
              await cache.put(url, response)
            }
            fetched++
          } catch {
            errors++
            fetched++
          }
        })
        await Promise.all(promises)
        
        setDownloadedTiles(fetched)
        setProgress(Math.round((fetched / urls.length) * 100))
        
        // Brief pause to avoid hammering
        if (i + BATCH_SIZE < urls.length) {
          await new Promise(r => setTimeout(r, 50))
        }
      }

      setCacheStatus('done')
      await checkCacheSize()
      
      if (errors > 0) {
        console.warn(`[TilePrefetch] ${errors} tiles failed to download`)
      }
    } catch (err) {
      console.error('[TilePrefetch] Error:', err)
      setCacheStatus('error')
    }
  }, [])

  const clearCache = useCallback(async () => {
    if (!confirm('Alle gecachten Kartenkacheln löschen?')) return
    
    try {
      const deleted = await caches.delete('mapbox-tiles-v1')
      // Also clear workbox caches
      await caches.delete('mapbox-tiles')
      
      if (deleted) {
        setCacheStatus('idle')
        setProgress(0)
        setDownloadedTiles(0)
        await checkCacheSize()
        alert('✅ Cache gelöscht')
      } else {
        alert('Kein Cache zum Löschen gefunden')
      }
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
            Lädt Kartenkacheln für alle {tripData.locations.length} Reiseziele herunter (Zoom {ZOOM_LEVELS[0]}–{ZOOM_LEVELS[ZOOM_LEVELS.length-1]}). 
            Damit funktioniert die Karte auch ohne Internet.
          </div>

          <div className="flex items-center gap-2 text-xs text-chile-text-muted mb-3">
            <span>📊</span>
            <span>~{estimatedTiles.toLocaleString()} Kacheln • ~{estimatedSizeMB} MB geschätzt</span>
          </div>

          {/* Progress Bar */}
          {cacheStatus === 'downloading' && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-chile-text-muted mb-1">
                <span>Herunterladen...</span>
                <span>{downloadedTiles}/{totalTiles} ({progress}%)</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-chile-accent-teal rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-[10px] text-chile-text-muted mt-1">
                Bitte die App nicht schließen...
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
              onClick={prefetchTiles}
              disabled={cacheStatus === 'downloading'}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                cacheStatus === 'downloading' 
                  ? 'bg-chile-accent-teal/30 text-chile-accent-teal cursor-not-allowed'
                  : 'bg-chile-accent-teal text-white hover:bg-chile-accent-teal/80'
              }`}
            >
              <span>{cacheStatus === 'downloading' ? '⏳' : '🗺️'}</span>
              {cacheStatus === 'downloading' ? 'Lädt...' : cacheStatus === 'done' ? 'Erneut laden' : 'Karte offline speichern'}
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
              <span>Version</span><span className="text-chile-text-muted">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Reiseziele</span><span className="text-chile-text-muted">{tripData.locations.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Empfehlungen</span>
              <span className="text-chile-text-muted">
                {tripData.locations.reduce((acc, loc) => acc + loc.recommendations.length, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Reisedauer</span><span className="text-chile-text-muted">{tripData.trip.totalDays} Tage</span>
            </div>
            <div className="flex justify-between">
              <span>Karte</span><span className="text-chile-text-muted">Mapbox Dark v11</span>
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
