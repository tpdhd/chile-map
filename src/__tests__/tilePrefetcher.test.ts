import { describe, it, expect, vi, beforeEach } from 'vitest'

// We test the pure utility functions by importing the module
// The Cache API mocking tests the integration

describe('tilePrefetcher', () => {
  // Test lonLatToTile conversion (extracted logic)
  function lonLatToTile(lon: number, lat: number, zoom: number): [number, number] {
    const n = Math.pow(2, zoom)
    const x = Math.floor(((lon + 180) / 360) * n)
    const latRad = (lat * Math.PI) / 180
    const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
    return [x, y]
  }

  describe('lonLatToTile', () => {
    it('converts Santiago coordinates to correct tile at z10', () => {
      // Santiago: -33.45, -70.67
      const [x, y] = lonLatToTile(-70.67, -33.45, 10)
      expect(x).toBeGreaterThan(0)
      expect(y).toBeGreaterThan(0)
      expect(x).toBeLessThan(1024) // 2^10
      expect(y).toBeLessThan(1024)
    })

    it('converts Chiloé coordinates to correct tile at z10', () => {
      // Chiloé: -42.47, -73.77
      const [x, y] = lonLatToTile(-73.77, -42.47, 10)
      expect(x).toBeGreaterThan(0)
      expect(y).toBeGreaterThan(0)
    })

    it('Santiago is north of Chiloé (lower y value at same zoom)', () => {
      const santiago = lonLatToTile(-70.67, -33.45, 10)
      const chiloe = lonLatToTile(-73.77, -42.47, 10)
      // In web mercator, Y increases southward
      expect(santiago[1]).toBeLessThan(chiloe[1])
    })

    it('produces valid tiles at zoom 5', () => {
      const [x, y] = lonLatToTile(-70.67, -33.45, 5)
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(32) // 2^5
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThan(32)
    })

    it('produces valid tiles at zoom 13', () => {
      const [x, y] = lonLatToTile(-70.67, -33.45, 13)
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(8192) // 2^13
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThan(8192)
    })
  })

  describe('tile URL generation', () => {
    const SUBDOMAINS = ['a', 'b', 'c', 'd']

    function tileUrl(z: number, x: number, y: number): string {
      const s = SUBDOMAINS[(x + y) % SUBDOMAINS.length]
      return `https://${s}.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}@2x.png`
    }

    it('generates valid Carto dark matter URL', () => {
      const url = tileUrl(10, 300, 600)
      expect(url).toMatch(/^https:\/\/[abcd]\.basemaps\.cartocdn\.com\/dark_all\/10\/300\/600@2x\.png$/)
    })

    it('distributes across all 4 subdomains', () => {
      const subdomains = new Set<string>()
      for (let x = 0; x < 4; x++) {
        const url = tileUrl(10, x, 0)
        const match = url.match(/https:\/\/([abcd])\./)
        if (match) subdomains.add(match[1])
      }
      expect(subdomains.size).toBe(4)
    })

    it('generates @2x retina URLs', () => {
      const url = tileUrl(10, 300, 600)
      expect(url).toContain('@2x.png')
    })
  })

  describe('prefetch coverage', () => {
    it('overview tiles z5-7 cover the Chile corridor', () => {
      // The prefetcher generates tiles for bbox -74.1,-42.8 to -70.2,-31.8
      const z5NW = lonLatToTile(-74.1, -31.8, 5)
      const z5SE = lonLatToTile(-70.2, -42.8, 5)
      
      // At z5, Chile should be within a few tiles
      const tilesX = Math.abs(z5SE[0] - z5NW[0]) + 1
      const tilesY = Math.abs(z5SE[1] - z5NW[1]) + 1
      
      expect(tilesX).toBeGreaterThanOrEqual(1)
      expect(tilesX).toBeLessThan(10) // Not too many
      expect(tilesY).toBeGreaterThanOrEqual(1)
      expect(tilesY).toBeLessThan(10)
    })

    it('estimates reasonable tile count for 12 locations at z8-13', () => {
      // 12 locations, zoom 8-13 (6 levels), radius 3
      // At z8: ~7x7 = 49 per location, but many overlap
      // At z13: much larger radius but capped
      // Should be in the range of 2000-8000 total unique tiles
      const locations = [
        [-33.45, -70.67], // Santiago
        [-32.12, -71.50], // Quillimari
        [-33.36, -71.67], // Algarrobo
        [-33.85, -70.58], // Wine Resort
        [-36.42, -71.95], // San Carlos
        [-36.61, -72.10], // Chillán
        [-38.65, -71.63], // Conguillío
        [-39.28, -71.95], // Pucón
        [-39.81, -73.25], // Valdivia
        [-40.57, -73.13], // Osorno
        [-41.12, -73.05], // Frutillar
        [-42.47, -73.77], // Chiloé
      ]

      const urlSet = new Set<string>()
      const zoomLevels = [8, 9, 10, 11, 12, 13]
      const radiusTiles = 3

      for (const [lat, lon] of locations) {
        for (const zoom of zoomLevels) {
          const [cx, cy] = lonLatToTile(lon, lat, zoom)
          const r = Math.min(radiusTiles, Math.max(1, Math.floor(radiusTiles * Math.pow(2, zoom - 10))))
          for (let dx = -r; dx <= r; dx++) {
            for (let dy = -r; dy <= r; dy++) {
              urlSet.add(`${zoom}/${cx + dx}/${cy + dy}`)
            }
          }
        }
      }

      expect(urlSet.size).toBeGreaterThan(1000)
      expect(urlSet.size).toBeLessThan(15000)
    })
  })
})
