// PMTiles Range Request Service Worker
// This SW handles .pmtiles range requests by serving from the cache
// It works alongside the Workbox-generated SW

const PMTILES_CACHE = 'pmtiles-offline-v1'

self.addEventListener('fetch', (event) => {
  const url = event.request.url
  if (!url.endsWith('.pmtiles')) return

  event.respondWith(
    (async () => {
      try {
        const cache = await caches.open(PMTILES_CACHE)
        // Look for the full cached response (ignoring search params and vary)
        const cached = await cache.match(url, { ignoreSearch: true, ignoreVary: true })
        
        if (cached) {
          const rangeHeader = event.request.headers.get('range')
          if (rangeHeader) {
            // Parse range request and serve slice from cached full response
            const buf = await cached.arrayBuffer()
            const match = rangeHeader.match(/bytes=(\d+)-(\d+)?/)
            if (match) {
              const start = parseInt(match[1])
              const end = match[2] ? parseInt(match[2]) : buf.byteLength - 1
              const slice = buf.slice(start, end + 1)
              return new Response(slice, {
                status: 206,
                statusText: 'Partial Content',
                headers: {
                  'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`,
                  'Content-Length': String(slice.byteLength),
                  'Content-Type': 'application/octet-stream',
                  'Accept-Ranges': 'bytes',
                }
              })
            }
            // If range header can't be parsed, return full response
            return new Response(buf, {
              status: 200,
              headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Length': String(buf.byteLength),
              }
            })
          }
          // No range header, return full cached response
          return cached
        }
        
        // Not cached — fetch from network
        return fetch(event.request)
      } catch (err) {
        console.error('[PMTiles SW] Error:', err)
        return fetch(event.request)
      }
    })()
  )
})
