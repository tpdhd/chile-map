/**
 * Tile Prefetcher for Chile Trip Map
 *
 * Pre-downloads Carto Dark Matter tiles for all 12 trip locations
 * at zoom levels 8-13, ensuring offline map coverage for the entire route.
 *
 * Runs in the background after the app loads. Uses the Cache API directly
 * to store tiles that the Service Worker will serve on cache-hit.
 *
 * Estimated tiles: ~4,600 (z8-13, 3-tile radius per location)
 * Estimated storage: ~115 MB
 * Estimated time: 3-8 minutes on decent WiFi
 */

const CACHE_NAME = 'carto-tiles-v2'
const SUBDOMAINS = ['a', 'b', 'c', 'd']
const TILE_URL_TEMPLATE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'

/** Convert lon/lat to tile coordinates at a given zoom level */
function lonLatToTile(lon: number, lat: number, zoom: number): [number, number] {
  const n = Math.pow(2, zoom)
  const x = Math.floor(((lon + 180) / 360) * n)
  const latRad = (lat * Math.PI) / 180
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
  return [x, y]
}

/** Build a tile URL */
function tileUrl(z: number, x: number, y: number): string {
  const s = SUBDOMAINS[(x + y) % SUBDOMAINS.length]
  return TILE_URL_TEMPLATE.replace('{s}', s).replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y))
}

export interface PrefetchProgress {
  total: number
  fetched: number
  cached: number
  errors: number
  done: boolean
}

type ProgressCallback = (progress: PrefetchProgress) => void

/**
 * Pre-fetch tiles for a set of locations at multiple zoom levels.
 *
 * @param locations - Array of { coordinates: [lat, lon] }
 * @param zoomLevels - Zoom levels to prefetch (default: 8-13)
 * @param radiusTiles - Number of tiles in each direction from center (default: 3)
 * @param onProgress - Optional progress callback
 */
export async function prefetchTilesForLocations(
  locations: Array<{ coordinates: [number, number] }>,
  zoomLevels = [8, 9, 10, 11, 12, 13],
  radiusTiles = 3,
  onProgress?: ProgressCallback
): Promise<PrefetchProgress> {
  if (!('caches' in window)) {
    console.warn('[TilePrefetch] Cache API not available')
    return { total: 0, fetched: 0, cached: 0, errors: 0, done: true }
  }

  const cache = await caches.open(CACHE_NAME)

  // Collect all unique tile URLs
  const urlSet = new Set<string>()

  for (const loc of locations) {
    const [lat, lon] = loc.coordinates
    for (const zoom of zoomLevels) {
      const [cx, cy] = lonLatToTile(lon, lat, zoom)
      // Scale radius with zoom — fewer tiles needed at low zooms
      const r = Math.min(radiusTiles, Math.max(1, Math.floor(radiusTiles * Math.pow(2, zoom - 10))))

      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          urlSet.add(tileUrl(zoom, cx + dx, cy + dy))
        }
      }
    }
  }

  // Also add overview tiles (z5-7 for the whole Chile corridor)
  for (let z = 5; z <= 7; z++) {
    // Santiago area to Chiloé — broad coverage
    const nwTile = lonLatToTile(-74.1, -31.8, z)
    const seTile = lonLatToTile(-70.2, -42.8, z)
    const minX = Math.min(nwTile[0], seTile[0])
    const maxX = Math.max(nwTile[0], seTile[0])
    const minY = Math.min(nwTile[1], seTile[1])
    const maxY = Math.max(nwTile[1], seTile[1])
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        urlSet.add(tileUrl(z, x, y))
      }
    }
  }

  const urls = Array.from(urlSet)
  const progress: PrefetchProgress = {
    total: urls.length,
    fetched: 0,
    cached: 0,
    errors: 0,
    done: false,
  }

  console.log(`[TilePrefetch] Starting: ${urls.length} tiles to check`)

  // Process in batches to avoid hammering the server
  const BATCH_SIZE = 6 // 6 concurrent fetches
  const BATCH_DELAY_MS = 50 // small pause between batches

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE)

    const results = await Promise.allSettled(
      batch.map(async (url) => {
        // Check if already cached
        const existing = await cache.match(url)
        if (existing) {
          progress.cached++
          return 'cached'
        }

        // Fetch and store
        try {
          const response = await fetch(url, { mode: 'cors' })
          if (response.ok) {
            await cache.put(url, response)
            progress.fetched++
            return 'fetched'
          } else {
            progress.errors++
            return 'error'
          }
        } catch {
          progress.errors++
          return 'error'
        }
      })
    )

    // Report progress every batch
    if (onProgress) {
      onProgress({ ...progress })
    }

    // Small delay between batches to be respectful
    if (i + BATCH_SIZE < urls.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS))
    }
  }

  progress.done = true
  if (onProgress) onProgress({ ...progress })

  console.log(
    `[TilePrefetch] Done: ${progress.fetched} new, ${progress.cached} already cached, ${progress.errors} errors (${progress.total} total)`
  )

  return progress
}

/** Check how many tiles are already cached */
export async function getCacheStats(): Promise<{ count: number; estimatedMB: number }> {
  if (!('caches' in window)) return { count: 0, estimatedMB: 0 }
  
  try {
    const cache = await caches.open(CACHE_NAME)
    const keys = await cache.keys()
    const count = keys.length
    // Average tile size ~25KB
    const estimatedMB = Math.round((count * 25) / 1024)
    return { count, estimatedMB }
  } catch {
    return { count: 0, estimatedMB: 0 }
  }
}
