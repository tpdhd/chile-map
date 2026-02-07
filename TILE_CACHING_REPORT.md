# Tile Caching Strategy Report — Chile Map PWA

**Date:** 2025-02-07  
**App:** Chile Road Trip Map (react-leaflet + Mapbox Dark v11 @2x tiles)  
**Route:** Santiago → Puerto Montt/Chiloé (12 stops, ~1,200km corridor)

---

## Executive Summary

The Chile Map app currently uses Mapbox Dark v11 raster tiles via their Static Tiles API. The service worker has a caching rule for `basemaps.cartocdn.com` (Carto) — **but the app actually loads tiles from `api.mapbox.com`**, so **no tiles are being cached right now**. This is the first thing to fix regardless of which strategy is chosen.

Three options are presented below, ranked by feasibility. **The recommended approach is a hybrid: fix the service worker for opportunistic Mapbox tile caching (Option 1) plus a PMTiles-based offline fallback (Option 3).**

---

## Current State Analysis

### What the app uses
- **Tile URL:** `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}@2x?access_token=...`
- **Format:** Raster PNG tiles, 256px @2x (so 512px actual), dark style
- **Zoom range:** minZoom=4, maxZoom=22 (though tiles only go to ~22)
- **Service worker:** Workbox via vite-plugin-pwa, CacheFirst for Carto tiles (mismatched!)

### Bug: Service worker caches wrong domain
The Workbox config caches `basemaps.cartocdn.com` but the TileLayer loads from `api.mapbox.com`. This means **zero tile caching is happening**. This is a quick fix.

---

## Route & Storage Calculations

### The 12 Locations
| # | Location | Latitude | Longitude |
|---|----------|----------|-----------|
| 1 | Santiago | -33.45 | -70.67 |
| 2 | Quillimari | -32.12 | -71.50 |
| 3 | Algarrobo | -33.36 | -71.67 |
| 4 | Wine Resort (Wedding) | -33.85 | -70.58 |
| 5 | San Carlos / Villa Baviera | -36.42 | -71.95 |
| 6 | Chillán | -36.61 | -72.10 |
| 7 | Conguillío & Malalcahuello | -38.65 | -71.63 |
| 8 | Pucón Area | -39.28 | -71.95 |
| 9 | Valdivia | -39.81 | -73.25 |
| 10 | Osorno | -40.57 | -73.13 |
| 11 | Frutillar / Puerto Varas | -41.12 | -73.05 |
| 12 | Puerto Montt / Chiloé | -42.47 | -73.77 |

### Tile Count Estimates (30km radius per location)

| Zoom | Tiles | Cumulative | Use Case |
|------|------:|----------:|----------|
| 5 | 14 | 14 | Country overview |
| 6 | 20 | 34 | Regional view |
| 7 | 22 | 56 | Regional view |
| 8 | 34 | 90 | Area orientation |
| 9 | 45 | 135 | Area orientation |
| 10 | 100 | 235 | Metro area |
| 11 | 281 | 516 | City level |
| 12 | 911 | 1,427 | Town/district |
| 13 | 3,206 | 4,633 | Suburb/village |
| 14 | 12,149 | 16,782 | Neighborhood |
| 15 | 47,778 | 64,560 | Street level |

### Storage Estimates

| Scenario | Tiles | Raster @2x (~25KB/tile) | Vector (~15KB/tile) |
|----------|------:|------------------------:|--------------------:|
| **Zoom 5–13, 30km radius** | 4,633 | **~113 MB** | ~68 MB |
| **Zoom 5–14, 30km radius** | 16,782 | **~410 MB** | ~246 MB |
| **Zoom 5–15, 30km radius** | 64,560 | **~1.6 GB** | ~946 MB |
| Full corridor bbox, z5–15 | 579,874 | ~14.2 GB | ~8.5 GB |

**Key insight:** Zoom 14–15 account for 93% of tiles. Capping at zoom 13 keeps storage very manageable (~113 MB).

---

## Mapbox Terms of Service — Critical Constraints

### What's Allowed ✅
1. **Device-level caching** for individual end users — Mapbox explicitly permits this
2. **Browser/HTTP caching** respecting Cache-Control headers (Mapbox sets `max-age` on tiles)
3. **Service worker caching** of tiles that were loaded through normal user interaction (opportunistic caching)
4. Native SDK offline: 6,000 tile limit per user (not applicable to web/PWA)

### What's NOT Allowed ❌
1. **Bulk pre-downloading/scraping** tiles to build an offline cache
2. **Redistributing** cached tiles to other users/devices
3. **Storing tiles indefinitely** beyond Mapbox's cache headers
4. **Server-side caching** or proxying Mapbox tiles through your own backend
5. Using cached Mapbox tiles without an active access token / internet validation

### Gray Area ⚠️
- Service worker with CacheFirst strategy: **technically fine** if the tiles were originally fetched by the user. The concern is longevity — Mapbox expects tiles to expire per their Cache-Control headers. Overriding this (e.g., 30-day cache) is a soft ToS violation.
- Pre-seeding the cache by programmatically fetching tiles the user hasn't viewed: **likely a ToS violation** and could get your access token revoked.

### Bottom Line
You can cache tiles the user has already viewed. You **cannot** pre-download tiles for areas not yet visited. For true offline capability, you need a non-Mapbox tile source.

---

## Option 1: Fix Service Worker Tile Caching (Opportunistic)

### What it does
Cache Mapbox tiles as the user views them. Next time the same tile is needed, it's served instantly from the cache.

### Implementation

Fix the existing Workbox config in `vite.config.ts`:

```typescript
runtimeCaching: [
  {
    // Match Mapbox tile requests (current tile provider)
    urlPattern: /^https:\/\/api\.mapbox\.com\/styles\/v1\/.*\/tiles\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'mapbox-tiles',
      expiration: {
        maxEntries: 5000,       // ~125 MB at 25KB/tile
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  {
    // Also cache Mapbox fonts, sprites, etc.
    urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'mapbox-resources',
      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      },
    },
  },
],
```

### What you get
- ✅ **Instant loading** of previously viewed tiles (no white spaces when revisiting areas)
- ✅ **Works offline** for areas you've already browsed
- ✅ **Zero extra storage** beyond what the user naturally loads
- ✅ **Mapbox ToS compliant** (caching user-viewed tiles is allowed)
- ✅ **5 minutes** to implement

### What you DON'T get
- ❌ No offline maps for areas you haven't visited yet
- ❌ No guaranteed coverage (depends on what you browsed + zoom levels)
- ❌ If you zoom into Santiago at z14, you won't have Pucón at z14 cached

### Complexity: ⭐ (trivial)
### Storage: 0–500 MB (depends on browsing behavior)
### ToS Risk: ✅ Low (standard browser caching)

---

## Option 2: Switch to Free OSM Tiles + Aggressive Caching

### What it does
Replace Mapbox tiles with a free, open-source tile provider that has no caching restrictions. Then apply aggressive service worker caching, including optional pre-fetching.

### Tile Provider Options

| Provider | Style | Caching OK? | Speed | Dark Mode |
|----------|-------|-------------|-------|-----------|
| **Carto Dark Matter** | Dark | ✅ Yes | Fast CDN | ✅ Native dark |
| **Stadia Alidade Smooth Dark** | Dark | ✅ Yes | Fast | ✅ Native dark |
| **OpenFreeMap** | Custom | ✅ Yes (open-source) | Good | Via MapLibre style |
| OpenStreetMap | Standard | ⚠️ Limited | Moderate | ❌ Light only |

**Recommended: Carto Dark Matter** — Free, fast, dark style, no API key needed, no caching restrictions.

### Implementation

1. **Change TileLayer URL** in `Map.tsx`:
```tsx
<TileLayer
  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"
  attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
  subdomains="abcd"
  maxZoom={20}
  tileSize={256}
/>
```

2. **Service worker already caches Carto!** The existing Workbox config matches `basemaps.cartocdn.com`. It was clearly meant for this provider originally.

3. **Optional: Pre-fetch tiles** for the route on first load:
```typescript
// Pre-fetch key tiles for all 12 locations at zoom 10-13
async function prefetchRouteTiles() {
  const cache = await caches.open('map-tiles');
  const tileUrls = generateTileUrls(locations, [10, 11, 12, 13]);
  for (const url of tileUrls) {
    if (!(await cache.match(url))) {
      await cache.add(url);
      await new Promise(r => setTimeout(r, 50)); // Rate limit
    }
  }
}
```

### What you get
- ✅ **Full offline capability** for pre-fetched areas
- ✅ **No API key needed** (no risk of token revocation)
- ✅ **No ToS issues** with aggressive caching
- ✅ **Pre-fetching allowed** — download tiles for areas not yet visited
- ✅ **Similar visual quality** (Carto Dark Matter looks almost identical to Mapbox Dark)
- ✅ Existing service worker config already works!

### What you DON'T get
- ❌ Slightly different visual style than Mapbox Dark (but very close)
- ❌ Pre-fetching 4,633 tiles (z5–13) takes ~5 min on first load
- ❌ Carto may have rate limits on aggressive pre-fetching

### Complexity: ⭐⭐ (easy — mostly config changes)
### Storage: ~113 MB (z5–13) to ~410 MB (z5–14)
### ToS Risk: ✅ None (open tiles, no restrictions)

---

## Option 3: PMTiles Offline Basemap (Self-Contained)

### What it does
Bundle a PMTiles file (OpenStreetMap vector data for the Chile corridor) directly into the PWA. Tiles are served entirely from the local file — zero network needed.

### How PMTiles Works
- Single `.pmtiles` file contains all vector tiles for a region
- Uses HTTP Range Requests (or local file access) to read individual tiles on demand
- Rendered client-side using `protomaps-leaflet` (canvas-based, supports dark themes)
- Can be stored in the browser's Cache API, IndexedDB, or OPFS

### Implementation Steps

1. **Extract Chile corridor from global PMTiles:**
```bash
# Install pmtiles CLI
npm install -g pmtiles

# Extract just the Santiago-to-Chiloé corridor (z0-14)
pmtiles extract \
  https://build.protomaps.com/20250201.pmtiles \
  chile-corridor.pmtiles \
  --bbox=-74.1,-42.8,-70.2,-31.8
```

2. **Add protomaps-leaflet to the project:**
```bash
npm install protomaps-leaflet pmtiles
```

3. **Replace TileLayer with PMTiles layer:**
```tsx
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import * as protomapsL from 'protomaps-leaflet'

function PMTilesLayer() {
  const map = useMap()
  useEffect(() => {
    const layer = protomapsL.leafletLayer({
      url: '/chile-map/chile-corridor.pmtiles',
      paint_rules: protomapsL.paintRules(protomapsL.dark, ''),
      label_rules: protomapsL.labelRules(protomapsL.dark, ''),
    })
    layer.addTo(map)
    return () => { map.removeLayer(layer) }
  }, [map])
  return null
}
```

4. **Pre-cache the PMTiles file via service worker:**
```typescript
// In workbox config - precache the PMTiles file
globPatterns: ['**/*.{js,css,html,ico,png,svg,json,pmtiles}'],
```

Or load it into OPFS (Origin Private File System) for persistent storage.

### What you get
- ✅ **100% offline** — no internet needed at all after initial download
- ✅ **Vector tiles** — crisp at every zoom level, smaller file size
- ✅ **Built-in dark theme** via protomaps-leaflet
- ✅ **No API keys** — entirely self-contained
- ✅ **No ToS issues** — OpenStreetMap data, open license
- ✅ **Fast rendering** — local file, no network latency

### What you DON'T get
- ❌ Different visual style (protomaps dark ≠ Mapbox dark, but still good)
- ❌ Larger initial download (~80–150 MB for the corridor)
- ❌ More complex implementation (new rendering library)
- ❌ Canvas-based rendering may be slightly less smooth than raster tiles
- ❌ File must be updated periodically for OSM data changes (not a concern for a trip)

### Complexity: ⭐⭐⭐⭐ (significant refactoring)
### Storage: ~80–150 MB (vector tiles for the full corridor, z0–14)
### ToS Risk: ✅ None (OpenStreetMap data, ODbL license)

---

## Comparison Matrix

| Criteria | Option 1: Fix SW | Option 2: Carto + Cache | Option 3: PMTiles |
|----------|:-:|:-:|:-:|
| **Implementation time** | 5 min | 30 min | 4–8 hours |
| **Offline: visited areas** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Offline: unvisited areas** | ❌ No | ✅ With pre-fetch | ✅ Full corridor |
| **Storage required** | 0–500 MB | ~113–410 MB | ~80–150 MB |
| **Visual change** | None | Minimal | Noticeable |
| **Mapbox ToS risk** | Low | None | None |
| **Requires internet** | For new areas | For new areas | Never (after download) |
| **Maintains Mapbox style** | ✅ Yes | ❌ No | ❌ No |
| **Pre-download possible** | ❌ No | ✅ Yes | ✅ Built-in |
| **Complexity** | ⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

---

## 🏆 Recommendation: Staged Approach

### Phase 1 — Do Now (5 minutes)
**Fix the service worker** (Option 1). Change the Workbox URL pattern from `cartocdn.com` to `api.mapbox.com`. This alone gives you instant loading of revisited areas and is a massive UX improvement.

### Phase 2 — Before the Trip (30 minutes)  
**Switch to Carto Dark Matter tiles** (Option 2). The visual difference is negligible, you eliminate the Mapbox dependency and API key, and you can aggressively cache tiles. Pre-fetch tiles for all 12 locations at zoom 5–13 (~4,600 tiles, ~113 MB). **This is the sweet spot of effort vs. reward.**

### Phase 3 — Only If Needed
**PMTiles fallback** (Option 3). Only worth it if you'll genuinely be in areas with zero cell coverage for extended periods. The Chilean route (Santiago → Puerto Montt) has decent cell coverage along the Pan-American Highway. For remote areas like Conguillío or Chiloé's coast, Phase 2's pre-fetching should suffice.

### The 80/20 Answer
**Phase 2 alone solves 95% of the problem.** Switch to Carto Dark Matter, pre-fetch tiles for your route at z5–13, and you'll have a map that loads instantly and works offline for the entire trip. Total effort: 30 minutes. Total storage: ~113 MB.

---

## Appendix: Quick Implementation for Phase 2

### 1. Update `Map.tsx` — TileLayer
```tsx
<TileLayer
  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"
  attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
  subdomains="abcd"
  maxZoom={20}
  tileSize={256}
  crossOrigin="anonymous"
  className="smooth-tiles"
/>
```

### 2. Update `vite.config.ts` — Workbox (increase cache size)
```typescript
runtimeCaching: [
  {
    urlPattern: /^https:\/\/.*\.basemaps\.cartocdn\.com\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'map-tiles',
      expiration: {
        maxEntries: 8000,                    // Enough for z5-14
        maxAgeSeconds: 60 * 60 * 24 * 90,   // 90 days (covers the trip)
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
],
```

### 3. Add tile pre-fetcher (`src/utils/tilePrefetcher.ts`)
```typescript
// Generates tile URLs for given locations and zoom levels
function lonLatToTile(lon: number, lat: number, zoom: number): [number, number] {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return [x, y];
}

export async function prefetchTilesForLocations(
  locations: Array<{ coordinates: [number, number] }>,
  zoomLevels = [8, 9, 10, 11, 12, 13],
  radiusTiles = 3 // tiles in each direction from center
) {
  const cache = await caches.open('map-tiles');
  const subdomains = ['a', 'b', 'c', 'd'];
  let fetched = 0;

  for (const loc of locations) {
    for (const zoom of zoomLevels) {
      const [cx, cy] = lonLatToTile(loc.coordinates[1], loc.coordinates[0], zoom);
      const radius = Math.min(radiusTiles, Math.pow(2, zoom - 8)); // scale radius with zoom

      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const x = cx + dx;
          const y = cy + dy;
          const s = subdomains[(x + y) % 4];
          const url = `https://${s}.basemaps.cartocdn.com/dark_all/${zoom}/${x}/${y}@2x.png`;

          if (!(await cache.match(url))) {
            try {
              await cache.add(url);
              fetched++;
              if (fetched % 10 === 0) await new Promise(r => setTimeout(r, 100));
            } catch (e) { /* skip failed tiles */ }
          }
        }
      }
    }
  }
  console.log(`[TilePrefetch] Cached ${fetched} new tiles`);
}
```

### 4. Trigger pre-fetch after app loads
```typescript
// In App.tsx, after component mounts:
useEffect(() => {
  if ('caches' in window) {
    prefetchTilesForLocations(locations).catch(console.error);
  }
}, []);
```

---

*Report generated from analysis of the chile-map source code, Mapbox ToS, and tile calculation models.*
