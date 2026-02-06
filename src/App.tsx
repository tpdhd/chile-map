import { useState, useEffect, Suspense, lazy } from 'react'
import { MapLoading } from './components/LoadingState'
import tripData from './data/trip-data.json'

// Lazy load the map for faster initial render
const Map = lazy(() => import('./components/Map'))

export type Location = typeof tripData.locations[0]
export type Recommendation = typeof tripData.locations[0]['recommendations'][0]

const FAVORITES_KEY = 'chile-trip-favorites'
const NOTES_KEY = 'chile-trip-notes'
const VISITED_KEY = 'chile-trip-visited'

// Category icons for quick visual reference
const CATEGORY_ICONS: Record<string, string> = {
  'Restaurant': '🍽️',
  'Café': '☕',
  'Bar': '🍺',
  'Viewpoint': '🏔️',
  'Museum': '🏛️',
  'Market': '🛒',
  'Park': '🌳',
  'Beach': '🏖️',
  'Winery': '🍷',
  'Nature': '🌿',
  'Historic': '🏰',
  'Activity': '🎯',
  'Shopping': '🛍️',
}

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sheetExpanded, setSheetExpanded] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  // Load saved data from localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem(FAVORITES_KEY)
      if (savedFavorites) setFavorites(new Set(JSON.parse(savedFavorites)))
      
      const savedNotes = localStorage.getItem(NOTES_KEY)
      if (savedNotes) setNotes(JSON.parse(savedNotes))
      
      const savedVisited = localStorage.getItem(VISITED_KEY)
      if (savedVisited) setVisited(new Set(JSON.parse(savedVisited)))
    } catch {}
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]))
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
    localStorage.setItem(VISITED_KEY, JSON.stringify([...visited]))
  }, [favorites, notes, visited])

  // Select first location by default
  useEffect(() => {
    if (tripData.locations.length > 0 && !selectedLocation) {
      setSelectedLocation(tripData.locations[0])
    }
  }, [])

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    setSelectedRecommendation(null)
    setSheetExpanded(true)
    setShowLocationPicker(false)
  }

  const handleRecommendationSelect = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation)
    setSheetExpanded(true)
  }

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  const toggleVisited = (id: string) => {
    const newVisited = new Set(visited)
    if (newVisited.has(id)) {
      newVisited.delete(id)
    } else {
      newVisited.add(id)
    }
    setVisited(newVisited)
  }

  // Filter recommendations by search and category
  const filteredRecommendations = selectedLocation?.recommendations.filter(rec => {
    const matchesCategory = !activeCategory || rec.category === activeCategory
    const matchesSearch = !searchQuery || 
      rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.nameEs?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  }) || []

  // Get unique categories for current location
  const categories = selectedLocation 
    ? [...new Set(selectedLocation.recommendations.map(r => r.category))]
    : []

  // Days until trip
  const tripStart = new Date(tripData.trip.startDate)
  const now = new Date()
  const daysUntil = Math.ceil((tripStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="h-screen w-screen overflow-hidden bg-chile-bg-primary relative">
      {/* FULL SCREEN MAP */}
      <div className="absolute inset-0">
        <Suspense fallback={<MapLoading />}>
          <Map 
            locations={tripData.locations}
            selectedLocation={selectedLocation}
            selectedRecommendation={selectedRecommendation}
            onLocationSelect={handleLocationSelect}
            onRecommendationSelect={handleRecommendationSelect}
            activeCategory={activeCategory}
          />
        </Suspense>
      </div>

      {/* FLOATING HEADER - Top Left */}
      <div className="absolute top-4 left-4 z-[600] flex items-center gap-2">
        {/* Location Picker Button */}
        <button
          onClick={() => setShowLocationPicker(!showLocationPicker)}
          className="px-4 py-2 bg-chile-bg-card/95 backdrop-blur-sm rounded-xl shadow-lg flex items-center gap-2 border border-white/10"
        >
          <span className="text-lg">🇨🇱</span>
          <span className="font-medium max-w-[120px] truncate">{selectedLocation?.name || 'Wähle Ort'}</span>
          <span className="text-chile-text-muted">{showLocationPicker ? '▲' : '▼'}</span>
        </button>

        {/* Days Counter - Only show before trip */}
        {daysUntil > 0 && (
          <div className="px-3 py-2 bg-chile-accent-red/90 backdrop-blur-sm rounded-xl shadow-lg text-white">
            <span className="font-bold">{daysUntil}</span>
            <span className="text-xs ml-1">Tage</span>
          </div>
        )}
      </div>

      {/* FLOATING MENU - Top Right */}
      <div className="absolute top-4 right-4 z-[600]">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-10 h-10 bg-chile-bg-card/95 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center border border-white/10"
        >
          <span className="text-lg">☰</span>
        </button>

        {/* Menu Dropdown */}
        {showMenu && (
          <div className="absolute top-12 right-0 bg-chile-bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/10 min-w-[200px] overflow-hidden">
            <button
              onClick={() => {
                const coords = tripData.locations.map(loc => `${loc.coordinates[0]},${loc.coordinates[1]}`)
                const origin = coords[0]
                const destination = coords[coords.length - 1]
                const waypoints = coords.slice(1, -1).join('|')
                window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`, '_blank')
                setShowMenu(false)
              }}
              className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3"
            >
              <span>🗺️</span> Komplette Route
            </button>
            <button
              onClick={() => {
                alert(`Stats:\n\n❤️ ${favorites.size} Favoriten\n✅ ${visited.size} Besucht\n📝 ${Object.keys(notes).length} Notizen`)
                setShowMenu(false)
              }}
              className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3"
            >
              <span>📊</span> Statistik
            </button>
            <button
              onClick={() => {
                // Export favorites as text
                const allRecs = tripData.locations.flatMap(loc => 
                  loc.recommendations
                    .filter(rec => favorites.has(rec.id))
                    .map(rec => `${rec.name} (${loc.name})`)
                )
                if (allRecs.length === 0) {
                  alert('Keine Favoriten gespeichert')
                } else {
                  navigator.clipboard.writeText(allRecs.join('\n'))
                  alert(`✓ ${allRecs.length} Favoriten kopiert!`)
                }
                setShowMenu(false)
              }}
              className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3"
            >
              <span>📋</span> Favoriten kopieren
            </button>
            <div className="border-t border-white/10">
              <div className="px-4 py-2 text-xs text-chile-text-muted">
                {tripData.trip.totalDays} Tage • {tripData.locations.length} Orte
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LOCATION PICKER DROPDOWN */}
      {showLocationPicker && (
        <div className="absolute top-16 left-4 z-[600] bg-chile-bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/10 max-h-[60vh] overflow-y-auto w-72">
          {tripData.locations.map((loc, index) => (
            <button
              key={loc.id}
              onClick={() => handleLocationSelect(loc)}
              className={`w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 ${selectedLocation?.id === loc.id ? 'bg-chile-accent-red/20' : ''}`}
            >
              <span className="w-6 h-6 rounded-full bg-chile-accent-red/30 flex items-center justify-center text-xs font-bold">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{loc.name}</div>
                <div className="text-xs text-chile-text-muted">
                  {loc.recommendations.length} Empfehlungen • {loc.days} {loc.days === 1 ? 'Tag' : 'Tage'}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* BOTTOM SHEET */}
      <div 
        className={`
          absolute bottom-0 left-0 right-0 z-[500]
          bg-chile-bg-card/95 backdrop-blur-sm rounded-t-3xl shadow-lg
          transition-transform duration-300 ease-out
          ${sheetExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'}
        `}
        style={{ maxHeight: '75vh' }}
      >
        {/* Sheet Handle */}
        <div 
          className="flex justify-center py-3 cursor-pointer"
          onClick={() => setSheetExpanded(!sheetExpanded)}
        >
          <div className="w-12 h-1.5 bg-white/30 rounded-full" />
        </div>

        {/* Sheet Header - Always visible */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg truncate">{selectedLocation?.name || 'Wähle einen Ort'}</h2>
              {selectedLocation && (
                <p className="text-sm text-chile-text-muted">
                  {selectedLocation.recommendations.length} Empfehlungen
                </p>
              )}
            </div>
            <button
              onClick={() => setSheetExpanded(!sheetExpanded)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <span className={`transform transition-transform ${sheetExpanded ? 'rotate-180' : ''}`}>▲</span>
            </button>
          </div>
        </div>

        {/* Sheet Content - Only when expanded */}
        {sheetExpanded && selectedLocation && (
          <div className="overflow-y-auto px-4 pb-6" style={{ maxHeight: 'calc(75vh - 100px)' }}>
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 rounded-xl text-sm placeholder:text-chile-text-muted focus:outline-none focus:ring-2 focus:ring-chile-accent-teal"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${!activeCategory ? 'bg-chile-accent-red text-white' : 'bg-white/10'}`}
              >
                Alle ({selectedLocation.recommendations.length})
              </button>
              {categories.map(cat => {
                const count = selectedLocation.recommendations.filter(r => r.category === cat).length
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex items-center gap-1 ${activeCategory === cat ? 'bg-chile-accent-teal text-white' : 'bg-white/10'}`}
                  >
                    <span>{CATEGORY_ICONS[cat] || '📍'}</span>
                    <span>{cat}</span>
                    <span className="opacity-60">({count})</span>
                  </button>
                )
              })}
            </div>

            {/* Recommendations List */}
            <div className="space-y-3">
              {filteredRecommendations.map(rec => (
                <div 
                  key={rec.id}
                  className={`
                    p-4 rounded-xl transition-all
                    ${selectedRecommendation?.id === rec.id ? 'bg-chile-accent-red/20 ring-1 ring-chile-accent-red' : 'bg-white/5'}
                    ${visited.has(rec.id) ? 'border-l-4 border-green-500' : ''}
                  `}
                  onClick={() => handleRecommendationSelect(rec)}
                >
                  <div className="flex items-start gap-3">
                    {/* Category Icon */}
                    <span className="text-2xl">{CATEGORY_ICONS[rec.category] || '📍'}</span>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{rec.name}</span>
                        {visited.has(rec.id) && <span className="text-green-400 text-xs">✓</span>}
                      </div>
                      {rec.nameEs && (
                        <div className="text-xs text-chile-text-muted truncate">{rec.nameEs}</div>
                      )}
                      <div className="text-xs text-chile-text-muted mt-1">
                        {rec.category}
                        {rec.priceRange && ` • ${rec.priceRange}`}
                      </div>
                      {rec.description && (
                        <p className="text-sm text-chile-text-secondary mt-2 line-clamp-2">{rec.description}</p>
                      )}
                      {notes[rec.id] && (
                        <div className="mt-2 text-xs bg-chile-accent-teal/20 text-chile-accent-teal px-2 py-1 rounded">
                          📝 {notes[rec.id]}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(rec.id)
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${favorites.has(rec.id) ? 'bg-red-500' : 'bg-white/10'}`}
                      >
                        {favorites.has(rec.id) ? '❤️' : '🤍'}
                      </button>
                      <a
                        href={rec.googleMapsLink || `https://maps.google.com/?q=${rec.coordinates[0]},${rec.coordinates[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-full bg-chile-accent-teal flex items-center justify-center"
                      >
                        📍
                      </a>
                    </div>
                  </div>

                  {/* Expanded detail when selected */}
                  {selectedRecommendation?.id === rec.id && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                      {rec.address && (
                        <div className="text-sm">
                          <span className="text-chile-text-muted">📍 </span>
                          {rec.address}
                        </div>
                      )}
                      {rec.openingHours && (
                        <div className="text-sm">
                          <span className="text-chile-text-muted">🕐 </span>
                          {rec.openingHours}
                        </div>
                      )}
                      {rec.mustTry && rec.mustTry.length > 0 && (
                        <div className="text-sm">
                          <span className="text-chile-text-muted">⭐ Must-Try: </span>
                          {rec.mustTry.join(', ')}
                        </div>
                      )}
                      
                      {/* Actions Row */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleVisited(rec.id)
                          }}
                          className={`flex-1 py-2 rounded-lg text-sm ${visited.has(rec.id) ? 'bg-green-500 text-white' : 'bg-white/10'}`}
                        >
                          {visited.has(rec.id) ? '✅ Besucht' : '☐ Als besucht markieren'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const note = prompt('Notiz hinzufügen:', notes[rec.id] || '')
                            if (note !== null) {
                              if (note.trim()) {
                                setNotes({ ...notes, [rec.id]: note.trim() })
                              } else {
                                const newNotes = { ...notes }
                                delete newNotes[rec.id]
                                setNotes(newNotes)
                              }
                            }
                          }}
                          className="px-4 py-2 rounded-lg text-sm bg-white/10"
                        >
                          📝
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredRecommendations.length === 0 && (
              <div className="text-center py-8 text-chile-text-muted">
                Keine Ergebnisse gefunden
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(showLocationPicker || showMenu) && (
        <div 
          className="absolute inset-0 z-[550]"
          onClick={() => {
            setShowLocationPicker(false)
            setShowMenu(false)
          }}
        />
      )}
    </div>
  )
}

export default App
