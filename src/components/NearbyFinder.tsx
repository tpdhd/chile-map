import { useState, useCallback, useEffect } from 'react'
import tripData from '../data/trip-data.json'

type Recommendation = typeof tripData.locations[0]['recommendations'][0]

interface NearbyResult {
  recommendation: Recommendation
  locationName: string
  distanceKm: number
}

// Category icons
const CATEGORY_ICONS: Record<string, string> = {
  restaurant: '🍽️', café: '☕', cafe: '☕', bar: '🍺', hiking: '🥾',
  event: '🎪', museum: '🏛️', nature: '🌲', unique: '⭐', art: '🎨',
  hotspring: '♨️', beach: '🏖️', winery: '🍷', historical: '🏰',
  viewpoint: '👁️', shopping: '🛍️', waterfall: '💧', volcano: '🌋',
  lake: '💙', garden: '🌺', church: '⛪', monument: '🗿',
  theater: '🎭', nightlife: '🌙', transport: '🚂', food: '🥘',
  dessert: '🍰', seafood: '🦐',
}

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: 'Restaurant', café: 'Café', cafe: 'Café', bar: 'Bar',
  viewpoint: 'Aussichtspunkt', museum: 'Museum', beach: 'Strand',
  winery: 'Weingut', nature: 'Natur', historical: 'Historisch',
  unique: 'Besonders', art: 'Kunst', hotspring: 'Therme',
  hiking: 'Wandern', event: 'Event', waterfall: 'Wasserfall',
  volcano: 'Vulkan', lake: 'See', food: 'Essen', seafood: 'Meeresfrüchte',
  shopping: 'Einkaufen', nightlife: 'Nachtleben', dessert: 'Dessert',
}

// Haversine distance in km
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

// Walking time estimate (5 km/h)
function walkingTime(km: number): string {
  const minutes = Math.round(km / 5 * 60)
  if (minutes < 60) return `~${minutes} Min zu Fuß`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `~${hours}h ${mins}min zu Fuß`
}

// Driving time estimate (40 km/h city, 80 km/h highway)
function drivingTime(km: number): string {
  const speed = km < 10 ? 30 : 60
  const minutes = Math.round(km / speed * 60)
  if (minutes < 60) return `~${minutes} Min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `~${hours}h ${mins}min`
}

interface NearbyFinderProps {
  onClose: () => void
  favorites: Set<string>
}

export default function NearbyFinder({ onClose, favorites }: NearbyFinderProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<NearbyResult[]>([])
  const [maxDistance, setMaxDistance] = useState(10) // km
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const findNearby = useCallback(() => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation wird nicht unterstützt')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude
        const userLng = pos.coords.longitude
        setPosition({ lat: userLat, lng: userLng })

        // Calculate distances to all recommendations
        const allResults: NearbyResult[] = []
        for (const loc of tripData.locations) {
          for (const rec of loc.recommendations) {
            const dist = haversineKm(userLat, userLng, rec.coordinates[0], rec.coordinates[1])
            allResults.push({
              recommendation: rec,
              locationName: loc.name,
              distanceKm: dist,
            })
          }
        }

        // Sort by distance
        allResults.sort((a, b) => a.distanceKm - b.distanceKm)
        setResults(allResults)
        setLoading(false)
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Standortzugriff verweigert. Bitte erlaube GPS in deinen Browsereinstellungen.')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Standort nicht verfügbar.')
            break
          case err.TIMEOUT:
            setError('Zeitüberschreitung bei Standortabfrage.')
            break
          default:
            setError('Unbekannter Fehler bei Standortabfrage.')
        }
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    )
  }, [])

  // Auto-find on mount
  useEffect(() => {
    findNearby()
  }, [findNearby])

  // Filter results
  const filteredResults = results.filter(r => {
    if (r.distanceKm > maxDistance) return false
    if (filterCategory && r.recommendation.category !== filterCategory) return false
    if (favoritesOnly && !favorites.has(r.recommendation.id)) return false
    return true
  })

  // Get unique categories from results within distance
  const availableCategories = [...new Set(
    results.filter(r => r.distanceKm <= maxDistance).map(r => r.recommendation.category)
  )]

  // Google Maps search URL
  const getGoogleMapsUrl = (name: string, locationName: string) => {
    const query = `${name}, ${locationName}, Chile`
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
  }

  // Directions URL
  const getDirectionsUrl = (coords: number[]) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`
  }

  return (
    <div className="absolute inset-0 z-[700] bg-chile-bg-primary overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-chile-bg-primary/95 backdrop-blur-sm border-b border-white/10">
        <div className="px-4 py-3 flex items-center justify-between" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
            >
              ←
            </button>
            <div>
              <h1 className="font-bold text-lg">📍 In der Nähe</h1>
              {position && (
                <p className="text-xs text-chile-text-muted">
                  GPS: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={findNearby}
            disabled={loading}
            className="px-3 py-1.5 bg-chile-accent-teal rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {loading ? '⏳' : '🔄'} Aktualisieren
          </button>
        </div>

        {/* Distance Filter */}
        {results.length > 0 && (
          <div className="px-4 pb-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-chile-text-muted">Umkreis:</span>
              {[1, 5, 10, 25, 50, 100].map(km => (
                <button
                  key={km}
                  onClick={() => setMaxDistance(km)}
                  className={`px-2 py-1 rounded-full text-xs ${maxDistance === km ? 'bg-chile-accent-red text-white' : 'bg-white/10'}`}
                >
                  {km} km
                </button>
              ))}
            </div>

            {/* Category filter */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setFilterCategory(null)}
                className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${!filterCategory ? 'bg-chile-accent-red text-white' : 'bg-white/10'}`}
              >
                Alle
              </button>
              <button
                onClick={() => setFavoritesOnly(!favoritesOnly)}
                className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${favoritesOnly ? 'bg-red-500 text-white' : 'bg-white/10'}`}
              >
                ❤️ Favoriten
              </button>
              {availableCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
                  className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${filterCategory === cat ? 'bg-chile-accent-teal text-white' : 'bg-white/10'}`}
                >
                  {CATEGORY_ICONS[cat] || '📍'} {CATEGORY_LABELS[cat] || cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="text-5xl animate-pulse">📡</div>
          <p className="text-chile-text-muted">Standort wird ermittelt...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="m-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={findNearby}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {/* Not in Chile hint */}
      {position && results.length > 0 && results[0].distanceKm > 500 && (
        <div className="m-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl">
          <p className="text-amber-400 text-sm">
            🌍 Du bist ~{Math.round(results[0].distanceKm)} km vom nächsten Ort entfernt. 
            Diese Funktion ist besonders nützlich, wenn du in Chile bist!
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && results.length > 0 && (
        <div className="px-4 py-2 space-y-2">
          <p className="text-xs text-chile-text-muted">
            {filteredResults.length} Ergebnis{filteredResults.length !== 1 ? 'se' : ''} im Umkreis von {maxDistance} km
          </p>

          {filteredResults.slice(0, 50).map((result, idx) => (
            <div
              key={result.recommendation.id}
              className={`p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors ${
                favorites.has(result.recommendation.id) ? 'border-l-2 border-red-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Rank */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <span className="w-7 h-7 rounded-full bg-chile-accent-red/30 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-lg">{CATEGORY_ICONS[result.recommendation.category] || '📍'}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{result.recommendation.name}</span>
                    {favorites.has(result.recommendation.id) && <span className="text-red-500">❤️</span>}
                  </div>
                  <div className="text-xs text-chile-text-muted">
                    📍 {result.locationName} • {CATEGORY_LABELS[result.recommendation.category] || result.recommendation.category}
                    {result.recommendation.priceRange && ` • ${result.recommendation.priceRange}`}
                  </div>
                  
                  {/* Distance info */}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs font-bold text-chile-accent-teal">
                      {formatDistance(result.distanceKm)}
                    </span>
                    {result.distanceKm < 3 && (
                      <span className="text-xs text-chile-text-muted">
                        {walkingTime(result.distanceKm)}
                      </span>
                    )}
                    {result.distanceKm >= 3 && (
                      <span className="text-xs text-chile-text-muted">
                        🚗 {drivingTime(result.distanceKm)}
                      </span>
                    )}
                  </div>

                  {/* Description excerpt */}
                  {result.recommendation.description && (
                    <p className="text-xs text-chile-text-secondary mt-1 line-clamp-2">
                      {result.recommendation.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <a
                    href={getDirectionsUrl(result.recommendation.coordinates)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-chile-accent-teal flex items-center justify-center text-sm"
                    title="Navigation starten"
                  >
                    🧭
                  </a>
                  <a
                    href={getGoogleMapsUrl(result.recommendation.name, result.locationName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                    title="In Google Maps suchen"
                  >
                    <svg viewBox="0 0 48 48" className="w-4 h-4">
                      <path fill="#48b564" d="M35.76,26.36h0.01c0,0-3.77,5.53-6.94,9.64c-2.74,3.55-3.54,6.59-3.77,8.06c-0.21,1.36-0.66,3.94-1.02,3.94c-0.36,0-0.81-2.59-1.02-3.94c-0.23-1.47-1.03-4.51-3.77-8.06c-3.17-4.11-6.95-9.64-6.95-9.64S8,20.45,8,16c0-7.73,6.27-14,14-14s14,6.27,14,14C36,20.45,35.76,26.36,35.76,26.36z"/>
                      <circle cx="22" cy="16" r="5" fill="#fff"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}

          {filteredResults.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl">🔍</span>
              <p className="text-chile-text-muted mt-2">Keine Empfehlungen in diesem Umkreis</p>
              <button
                onClick={() => { setMaxDistance(100); setFilterCategory(null); setFavoritesOnly(false) }}
                className="mt-3 px-4 py-2 bg-chile-accent-red rounded-lg text-sm"
              >
                Alle anzeigen (100 km)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
