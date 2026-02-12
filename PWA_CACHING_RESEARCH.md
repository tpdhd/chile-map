# PWA Offline Caching Research & Implementation Plan
## Chile Map Project - 2026-02-12

---

## Executive Summary

Based on comprehensive research of 2025-2026 PWA best practices, the Chile Map app currently has:

✅ **Already Implemented:**
- Service worker registration with auto-update
- Map tile caching (Mapbox tiles with CacheFirst strategy)
- PWA manifest with icons
- `vite-plugin-pwa` with Workbox

❌ **Missing Critical Offline Features:**
- No caching of JSON data files (trip-data.json, etc.)
- No precaching of app shell (HTML/CSS/JS)
- No offline fallback page
- No explicit runtime caching for API calls

---

## Research Findings - Best PWA Caching Patterns (2025-2026)

### Sources
1. **Zeepalm PWA Caching Strategies Checklist** (https://www.zeepalm.com/blog/pwa-offline-functionality-caching-strategies-checklist)
2. **MagicBell Offline-First PWAs Guide** (https://www.magicbell.com/blog/offline-first-pwas-service-worker-caching-strategies)

### Key Takeaways

#### 1. **Cache-First Strategy** (Best for static assets)
- **Use for:** CSS, JS bundles, images, fonts, map tiles
- **Benefits:** Fastest load times, instant response, fully offline
- **Trade-offs:** Can serve stale content
- **Ideal for:** Versioned assets, rarely changing resources

#### 2. **Network-First Strategy** (Best for dynamic data)
- **Use for:** API responses, user-generated content, fresh data
- **Benefits:** Always tries to get latest data, graceful fallback
- **Trade-offs:** Slower when online, timeout delays
- **Ideal for:** Social feeds, real-time data with fallback tolerance

#### 3. **Stale-While-Revalidate** (Best for semi-dynamic content)
- **Use for:** Content where immediate freshness isn't critical
- **Benefits:** Fast initial response + always updating in background
- **Trade-offs:** Users see stale data first, double bandwidth
- **Ideal for:** News, product catalogs, avatar images

#### 4. **Cache-Only** (Best for precached app shell)
- **Use for:** Precached app shell, offline pages
- **Benefits:** Guaranteed instant load, predictable
- **Trade-offs:** Must be precached, never updates without SW update

### Modern Workbox Patterns (from research)

#### App Shell Caching
```javascript
// Precache critical assets during install
workbox.precaching.precacheAndRoute([
  { url: '/', revision: null },
  { url: '/styles/main.css', revision: null },
  { url: '/scripts/app.js', revision: null },
]);
```

#### Runtime Data Caching
```javascript
// Cache JSON data with expiration
workbox.routing.registerRoute(
  ({ url }) => url.pathname.endsWith('.json'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'json-data',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);
```

#### Map Tile Caching (Already Implemented)
```javascript
// CacheFirst for map tiles - ALREADY IN vite.config.ts
{
  urlPattern: /^https:\/\/api\.mapbox\.com\/styles\/v1\/.*\/tiles\/.*/i,
  handler: 'CacheFirst',
  options: {
    cacheName: 'mapbox-tiles-v1',
    expiration: {
      maxEntries: 8000,
      maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
    },
  },
}
```

---

## Current State Analysis

### What's Already Cached (from vite.config.ts)

1. **Map Tiles** ✅
   - Mapbox tiles: `api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/**`
   - CARTO tiles (legacy): `basemaps.cartocdn.com/**`
   - Strategy: CacheFirst
   - Storage: Up to 8,000 tiles (~200 MB)
   - Expiration: 90 days

2. **Mapbox Resources** ✅
   - Fonts, sprites, glyphs: `api.mapbox.com/**`
   - Strategy: CacheFirst
   - Storage: Up to 500 entries
   - Expiration: 30 days

3. **Google Fonts** ✅
   - fonts.googleapis.com, fonts.gstatic.com
   - Strategy: CacheFirst
   - Expiration: 1 year

4. **Static Assets (Precache)** ✅
   - Pattern: `**/*.{js,css,html,ico,png,svg,json}`
   - BUT: This only precaches files in `dist/` after build, not runtime JSON data

### What's NOT Cached (Gaps)

1. **JSON Data Files** ❌
   - `trip-data.json`, `facts.json`, `accommodations-*.json`, etc.
   - These are imported directly in React components
   - Vite bundles them into JS chunks, so they ARE precached indirectly
   - **No issue here - they're bundled!**

2. **Offline Fallback Page** ❌
   - No custom offline.html for when cache misses occur

3. **API Calls** ❌
   - No runtime caching for potential future API endpoints

4. **App Shell** ⚠️
   - HTML/CSS/JS are precached by Workbox automatically
   - But no explicit "app shell" architecture

---

## Implementation Plan - 3 Improvements

### 1. **Improve Precaching - Ensure All Critical Assets**

**Goal:** Explicitly precache app shell components

**Implementation:**
```typescript
// vite.config.ts - Update globPatterns
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webp,woff2}'],
  // Also include any custom offline page
  additionalManifestEntries: [
    { url: '/offline.html', revision: null }
  ],
}
```

**Acceptance Criteria:**
- ✅ All HTML/CSS/JS files are precached
- ✅ All images and fonts are precached
- ✅ Build output shows 100+ precached entries

---

### 2. **Add Offline Fallback Page**

**Goal:** Show a friendly offline page when network fails and resource isn't cached

**Implementation:**

Create `/public/offline.html`:
```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - Chile Map</title>
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #0f0f14 0%, #1a1a2e 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 20px;
    }
    .container {
      max-width: 400px;
    }
    h1 { font-size: 3em; margin: 0 0 20px; }
    p { color: #aaa; line-height: 1.6; }
    button {
      margin-top: 30px;
      padding: 12px 24px;
      background: #e11d48;
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    }
    button:hover { background: #be123c; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📡</h1>
    <h2>Du bist offline</h2>
    <p>Keine Internetverbindung. Diese Seite ist nicht gecached.</p>
    <p>Kehre zur Startseite zurück um gecachte Inhalte zu sehen.</p>
    <button onclick="window.location.href='/chile-map/'">Zur Startseite</button>
  </div>
</body>
</html>
```

Add to service worker config:
```typescript
// vite.config.ts - Add navigation fallback
workbox: {
  navigateFallback: '/chile-map/index.html',
  navigateFallbackDenylist: [/^\/api/],
}
```

**Acceptance Criteria:**
- ✅ Offline page is precached
- ✅ Navigation to uncached routes shows offline page
- ✅ Button navigates back to cached home

---

### 3. **Add Runtime Caching for Images/Assets**

**Goal:** Cache any dynamically loaded images or assets

**Implementation:**
```typescript
// vite.config.ts - Add runtime caching for images
runtimeCaching: [
  // ... existing map tile caching ...
  
  {
    // Cache any images loaded at runtime
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'image-cache',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  
  {
    // Cache fonts (if any loaded at runtime)
    urlPattern: /\.(?:woff|woff2|ttf|otf)$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'font-cache',
      expiration: {
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      },
    },
  },
]
```

**Acceptance Criteria:**
- ✅ Images loaded at runtime are cached
- ✅ Fonts loaded at runtime are cached
- ✅ Cache has expiration limits (prevent unlimited growth)

---

## Verification Plan

### 1. Build Test
```bash
npm run build
```

**Expected Output:**
```
PWA v0.17.5
mode      generateSW
precache  [100+] entries ([X] KiB)
files generated
  dist/sw.js
  dist/workbox-*.js
```

**Checks:**
- ✅ Build succeeds without errors
- ✅ Precache list includes offline.html
- ✅ Precache list includes all JS/CSS bundles
- ✅ Service worker file is generated

### 2. Chrome DevTools Test
1. Open app in Chrome
2. Open DevTools → Application tab
3. **Service Workers:** Verify SW is registered and activated
4. **Cache Storage:** Verify caches exist:
   - `workbox-precache-v2-/chile-map/` (app shell)
   - `mapbox-tiles-v1` (map tiles)
   - `image-cache`, `font-cache` (if any runtime assets)
5. **Offline Test:**
   - Check "Offline" in Network tab
   - Navigate to /chile-map/ → Should load from cache
   - Navigate to /chile-map/random-page → Should show offline.html

### 3. Build Output Analysis
```bash
cd dist
find . -type f -name "*.js" -o -name "*.css" -o -name "*.html" | wc -l
# Should show 30+ files
```

---

## Summary of Changes

### Files to Create
1. `/public/offline.html` - Offline fallback page

### Files to Modify
1. `/vite.config.ts` - Update workbox config:
   - Add `navigateFallback`
   - Add `offline.html` to precache
   - Add runtime image/font caching
   - Expand `globPatterns` to include more file types

### No Changes Needed
- ❌ JSON data files (already bundled by Vite)
- ❌ Service worker registration (already in main.tsx)
- ❌ Map tile caching (already implemented)

---

## Storage Estimates

| Cache | Content | Estimated Size |
|-------|---------|----------------|
| **Precache** | HTML, CSS, JS, Icons | ~1-5 MB |
| **Mapbox Tiles** | Up to 8,000 tiles | ~200 MB |
| **Mapbox Resources** | Fonts, sprites | ~5 MB |
| **Images** | Runtime images | ~10-50 MB |
| **Fonts** | Web fonts | ~1-5 MB |
| **Total** | | **~220-270 MB** |

This is well within browser storage limits (typically 50% of available disk space, minimum 1 GB).

---

## Comparison to Best Practices

| Best Practice | Current Status | After Implementation |
|--------------|----------------|----------------------|
| **App Shell Precaching** | ⚠️ Partial (automatic) | ✅ Explicit |
| **Static Asset Caching** | ✅ Yes | ✅ Enhanced |
| **Map Tile Caching** | ✅ Yes (CacheFirst) | ✅ No change |
| **Data Caching** | ✅ Bundled | ✅ No change needed |
| **Offline Fallback** | ❌ No | ✅ Yes |
| **Runtime Caching** | ⚠️ Partial | ✅ Complete |
| **Cache Expiration** | ✅ Yes | ✅ Yes |
| **Cache Size Limits** | ✅ Yes | ✅ Yes |

---

## Post-Implementation Testing

After deploying, test on actual device:

1. **Online Test:**
   - Load app
   - Browse all pages
   - Pan/zoom map to load tiles
   - Check DevTools → Cache Storage to verify caching

2. **Offline Test:**
   - Enable airplane mode
   - Reload app → Should load instantly
   - Navigate to all pages → Should work
   - Pan/zoom map → Cached tiles should appear
   - Try to access uncached route → Should show offline page

3. **Update Test:**
   - Make a change to app
   - Build and deploy
   - Reload app → Should show "Update available" banner
   - Click update → Should reload with new version

---

## Conclusion

The Chile Map app already has a solid PWA foundation with map tile caching. The three improvements above will:

1. **Ensure 100% offline capability** for all bundled assets
2. **Provide graceful offline experience** with custom fallback
3. **Cache runtime assets** for faster subsequent loads

**Total implementation time:** ~30 minutes  
**Storage overhead:** ~5-10 MB (mostly offline.html)  
**Benefit:** Full offline capability for entire trip to Chile

---

*Research completed: 2026-02-12*  
*Sources: Zeepalm, MagicBell, MDN PWA docs*
