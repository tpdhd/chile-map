import { useState, useEffect, useRef, useCallback, Suspense, lazy, useMemo } from 'react'
import { MapLoading } from './components/LoadingState'
import tripData from './data/trip-data.json'
import factsData from './data/facts.json'

// Lazy load the map for faster initial render
const Map = lazy(() => import('./components/Map'))
const CarRentalPage = lazy(() => import('./components/CarRentalPage'))
const SettingsPage = lazy(() => import('./components/SettingsPage'))

export type Location = typeof tripData.locations[0]
export type Recommendation = typeof tripData.locations[0]['recommendations'][0]

const FAVORITES_KEY = 'chile-trip-favorites'
const NOTES_KEY = 'chile-trip-notes'
const VISITED_KEY = 'chile-trip-visited'

// Category icons for quick visual reference
const CATEGORY_ICONS: Record<string, string> = {
  'restaurant': '🍽️',
  'café': '☕',
  'cafe': '☕',
  'bar': '🍺',
  'viewpoint': '👁️',
  'museum': '🏛️',
  'market': '🛒',
  'park': '🌳',
  'beach': '🏖️',
  'winery': '🍷',
  'nature': '🌲',
  'historical': '🏰',
  'activity': '🎯',
  'shopping': '🛍️',
  'unique': '⭐',
  'art': '🎨',
  'hotspring': '♨️',
  'hiking': '🥾',
  'event': '🎪',
  'waterfall': '💧',
  'volcano': '🌋',
  'lake': '💙',
  'garden': '🌺',
  'church': '⛪',
  'monument': '🗿',
  'theater': '🎭',
  'nightlife': '🌙',
  'transport': '🚂',
  'food': '🥘',
  'dessert': '🍰',
  'seafood': '🦐',
}

// Category German labels
const CATEGORY_LABELS: Record<string, string> = {
  'restaurant': 'Restaurant',
  'café': 'Café',
  'cafe': 'Café',
  'bar': 'Bar',
  'viewpoint': 'Aussichtspunkt',
  'museum': 'Museum',
  'market': 'Markt',
  'park': 'Park',
  'beach': 'Strand',
  'winery': 'Weingut',
  'nature': 'Natur',
  'historical': 'Historisch',
  'activity': 'Aktivität',
  'shopping': 'Einkaufen',
  'unique': 'Besonders',
  'art': 'Kunst',
  'hotspring': 'Therme',
  'hiking': 'Wandern',
  'event': 'Event',
  'waterfall': 'Wasserfall',
  'volcano': 'Vulkan',
  'lake': 'See',
  'garden': 'Garten',
  'church': 'Kirche',
  'monument': 'Denkmal',
  'theater': 'Theater',
  'nightlife': 'Nachtleben',
  'transport': 'Transport',
  'food': 'Essen',
  'dessert': 'Dessert',
  'seafood': 'Meeresfrüchte',
}

// Google Maps search URL helper
const getGoogleMapsSearchUrl = (name: string, locationName?: string) => {
  const query = locationName ? `${name}, ${locationName}, Chile` : `${name}, Chile`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
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
  const [globalSearchResults, setGlobalSearchResults] = useState<Array<{ location: Location; recommendation: Recommendation }>>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [showFacts, setShowFacts] = useState(false)
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const [showCarRental, setShowCarRental] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Get facts for current location or random
  const locationFacts = useMemo(() => {
    if (!selectedLocation) return factsData.facts
    const locFacts = factsData.facts.filter(
      f => f.location === selectedLocation.id || !f.location
    )
    return locFacts.length > 0 ? locFacts : factsData.facts
  }, [selectedLocation])

  // Global search across ALL locations and recommendations
  const performGlobalSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setGlobalSearchResults([])
      setShowSearchResults(false)
      return
    }
    const q = query.toLowerCase().trim()
    const results: Array<{ location: Location; recommendation: Recommendation }> = []
    for (const loc of tripData.locations) {
      for (const rec of loc.recommendations) {
        const matchesName = rec.name.toLowerCase().includes(q)
        const matchesNameEs = rec.nameEs?.toLowerCase().includes(q)
        const matchesCategory = rec.category.toLowerCase().includes(q)
        const matchesCategoryLabel = (CATEGORY_LABELS[rec.category.toLowerCase()] || '').toLowerCase().includes(q)
        const matchesDescription = rec.description?.toLowerCase().includes(q)
        const matchesTags = rec.tags?.some((tag: string) => tag.toLowerCase().includes(q))
        const matchesLocation = loc.name.toLowerCase().includes(q)
        const matchesAddress = rec.address?.toLowerCase().includes(q)
        if (matchesName || matchesNameEs || matchesCategory || matchesCategoryLabel || matchesDescription || matchesTags || matchesLocation || matchesAddress) {
          results.push({ location: loc, recommendation: rec })
        }
      }
    }
    setGlobalSearchResults(results)
    setShowSearchResults(true)
  }, [])

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      performGlobalSearch(searchQuery)
    }
    if (e.key === 'Escape') {
      setShowSearchResults(false)
      setSearchQuery('')
      searchInputRef.current?.blur()
    }
  }, [searchQuery, performGlobalSearch])

  const handleSearchResultClick = useCallback((result: { location: Location; recommendation: Recommendation }) => {
    // Select the location
    setSelectedLocation(result.location)
    // Select the recommendation
    setSelectedRecommendation(result.recommendation)
    // Expand the bottom sheet
    setSheetExpanded(true)
    // Clear search state
    setShowSearchResults(false)
    setSearchQuery('')
    // Clear category filter so the recommendation is visible
    setActiveCategory(null)
    // Scroll to the recommendation in the bottom sheet after render
    setTimeout(() => {
      const element = document.getElementById(`rec-${result.recommendation.id}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.classList.add('flash-highlight')
        setTimeout(() => element.classList.remove('flash-highlight'), 2000)
      }
    }, 400)
  }, [])

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

  const handleLocationSelect = (location: Location, fromMap: boolean = false) => {
    setSelectedLocation(location)
    setSelectedRecommendation(null)
    setSheetExpanded(true)
    
    if (fromMap) {
      // When clicked on map: open location picker briefly to show which location is highlighted
      setShowLocationPicker(true)
      // Auto-scroll to the location in the picker
      setTimeout(() => {
        const locEl = document.getElementById(`loc-${location.id}`)
        if (locEl) {
          locEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
          locEl.classList.add('location-flash')
          setTimeout(() => locEl.classList.remove('location-flash'), 2000)
        }
      }, 100)
      // Auto-close picker after 2.5s so user sees it then it gets out of the way
      setTimeout(() => setShowLocationPicker(false), 2500)
    } else {
      setShowLocationPicker(false)
    }
  }

  const handleRecommendationSelect = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation)
    setSheetExpanded(true)
    // Auto-scroll to recommendation in list with slight delay for animation
    setTimeout(() => {
      const element = document.getElementById(`rec-${recommendation.id}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Flash effect for visibility
        element.classList.add('flash-highlight')
        setTimeout(() => element.classList.remove('flash-highlight'), 2000)
      }
    }, 200)
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

  // Filter recommendations by search and category (searches through invisible tags too)
  const filteredRecommendations = selectedLocation?.recommendations.filter(rec => {
    const matchesCategory = !activeCategory || rec.category === activeCategory
    const query = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || 
      rec.name.toLowerCase().includes(query) ||
      rec.nameEs?.toLowerCase().includes(query) ||
      rec.category.toLowerCase().includes(query) ||
      rec.description?.toLowerCase().includes(query) ||
      rec.tags?.some(tag => tag.toLowerCase().includes(query))
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
    <div className="h-[100dvh] w-screen overflow-hidden bg-chile-bg-primary relative">
      {/* FULL SCREEN MAP */}
      <div className="absolute inset-0">
        <Suspense fallback={<MapLoading />}>
          <Map 
            locations={tripData.locations}
            selectedLocation={selectedLocation}
            selectedRecommendation={selectedRecommendation}
            onLocationSelect={(loc) => handleLocationSelect(loc, true)}
            onRecommendationSelect={handleRecommendationSelect}
            activeCategory={activeCategory}
          />
        </Suspense>
      </div>

      {/* FLOATING HEADER - Top Left */}
      <div className="absolute left-4 z-[600] flex items-center gap-2" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
        {/* Location Picker Button - Pulses when location selected */}
        <button
          onClick={() => setShowLocationPicker(!showLocationPicker)}
          className={`
            px-4 py-2 bg-chile-bg-card/95 backdrop-blur-sm rounded-xl shadow-lg flex items-center gap-2 
            border transition-all duration-300
            ${selectedLocation ? 'border-chile-accent-red/50 location-selected-btn' : 'border-white/10'}
          `}
        >
          <span className="text-lg">🇨🇱</span>
          <span className={`font-medium max-w-[120px] truncate ${selectedLocation ? 'text-chile-accent-red' : ''}`}>
            {selectedLocation?.name || 'Wähle Ort'}
          </span>
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

      {/* FLOATING MENU - Top Right with Search */}
      <div className="absolute right-4 z-[600] flex items-center gap-2" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
        {/* Omni-Search - Compact to avoid overlap */}
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="🔍"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              // Live search as user types
              if (e.target.value.trim().length >= 2) {
                performGlobalSearch(e.target.value)
              } else if (e.target.value.trim().length === 0) {
                setGlobalSearchResults([])
                setShowSearchResults(false)
              }
            }}
            onKeyDown={handleSearchKeyDown}
            className="w-10 focus:w-48 transition-all px-2 py-2 bg-chile-bg-card/95 backdrop-blur-sm rounded-xl shadow-lg text-sm placeholder:text-chile-text-muted focus:outline-none border border-white/10 focus:border-chile-accent-red/50 focus:placeholder:opacity-0"
          />
          {/* Global Search Results Dropdown */}
          {showSearchResults && globalSearchResults.length > 0 && (
            <div className="absolute top-12 right-0 bg-chile-bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/10 max-h-[60vh] overflow-y-auto w-72 animate-slide-up">
              <div className="px-3 py-2 border-b border-white/10 text-xs text-chile-text-muted">
                {globalSearchResults.length} Ergebnis{globalSearchResults.length !== 1 ? 'se' : ''} gefunden
              </div>
              {globalSearchResults.map((result, idx) => (
                <button
                  key={`${result.recommendation.id}-${idx}`}
                  onClick={() => handleSearchResultClick(result)}
                  className="w-full px-3 py-2.5 text-left hover:bg-white/10 flex items-center gap-2 transition-colors border-b border-white/5 last:border-b-0"
                >
                  <span className="text-lg flex-shrink-0">{CATEGORY_ICONS[result.recommendation.category] || '📍'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{result.recommendation.name}</div>
                    <div className="text-xs text-chile-text-muted truncate">
                      📍 {result.location.name} • {CATEGORY_LABELS[result.recommendation.category.toLowerCase()] || result.recommendation.category}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {showSearchResults && globalSearchResults.length === 0 && searchQuery.trim().length >= 2 && (
            <div className="absolute top-12 right-0 bg-chile-bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/10 w-60 animate-slide-up">
              <div className="px-4 py-3 text-sm text-chile-text-muted text-center">
                Keine Ergebnisse für "{searchQuery}"
              </div>
            </div>
          )}
        </div>
        
        {/* Burger Menu */}
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
                setShowCarRental(true)
                setShowMenu(false)
              }}
              className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3"
            >
              <span>🚗</span> Mietwagen Guide
            </button>
            <button
              onClick={() => {
                setShowSettings(true)
                setShowMenu(false)
              }}
              className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3"
            >
              <span>⚙️</span> Einstellungen
            </button>
            <button
              onClick={() => {
                setShowFacts(true)
                setShowMenu(false)
                // Random fact to start
                setCurrentFactIndex(Math.floor(Math.random() * locationFacts.length))
              }}
              className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3"
            >
              <span>📖</span> Chile Fakten ({factsData.totalFacts})
            </button>
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
              <button
                onClick={() => {
                  alert('ℹ️ Chile Trip Map\n\nKartendaten:\n© OpenStreetMap contributors\n© CARTO\n\nPowered by Leaflet\n\nMade with ❤️ for our Chile adventure')
                  setShowMenu(false)
                }}
                className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 text-chile-text-muted"
              >
                <span>ℹ️</span> Info & Credits
              </button>
              <div className="px-4 py-2 text-xs text-chile-text-muted">
                {tripData.trip.totalDays} Tage • {tripData.locations.length} Orte
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LOCATION PICKER DROPDOWN */}
      {showLocationPicker && (
        <div className="absolute left-4 z-[600] bg-chile-bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/10 max-h-[60vh] overflow-y-auto w-72" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 4rem)' }}>
          {tripData.locations.map((loc, index) => {
            const isSelected = selectedLocation?.id === loc.id
            return (
              <button
                key={loc.id}
                id={`loc-${loc.id}`}
                onClick={() => handleLocationSelect(loc, false)}
                className={`
                  w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-3 transition-all
                  ${isSelected ? 'bg-chile-accent-red/30 border-l-4 border-chile-accent-red animate-pulse-glow' : ''}
                `}
              >
                <span className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${isSelected ? 'bg-chile-accent-red text-white scale-110' : 'bg-chile-accent-red/30'}
                `}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${isSelected ? 'text-chile-accent-red' : ''}`}>{loc.name}</div>
                  <div className="text-xs text-chile-text-muted">
                    {loc.recommendations.length} Empfehlungen • {loc.durationDays} {loc.durationDays === 1 ? 'Tag' : 'Tage'}
                  </div>
                </div>
                {isSelected && <span className="text-chile-accent-red text-lg">◉</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* BOTTOM SHEET */}
      <div 
        className={`
          absolute bottom-0 left-0 right-0 z-[500]
          bg-chile-bg-card/95 backdrop-blur-sm rounded-t-3xl shadow-lg
          transition-transform duration-300 ease-out
          ${sheetExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-64px)]'}
        `}
        style={{ maxHeight: '50vh', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Sheet Handle - Clear drag indicator */}
        <div 
          className="flex flex-col items-center pt-2 pb-1 cursor-pointer group"
          onClick={() => setSheetExpanded(!sheetExpanded)}
        >
          <div className="w-10 h-1 bg-white/40 rounded-full group-hover:bg-white/60 transition-colors" />
          <div className="w-6 h-0.5 bg-white/20 rounded-full mt-1" />
        </div>

        {/* Sheet Header - Compact, with extra left padding for screen corners */}
        <div className="px-6 pb-2 pl-8">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setSheetExpanded(!sheetExpanded)}
          >
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base truncate">{selectedLocation?.name || 'Wähle einen Ort'}</h2>
              {selectedLocation && (
                <p className="text-xs text-chile-text-muted">
                  {selectedLocation.recommendations.length} Empfehlungen
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sheet Content - Only when expanded */}
        {sheetExpanded && selectedLocation && (
          <div className="overflow-y-auto px-4 pb-4" style={{ maxHeight: 'calc(50vh - 70px)' }}>
            {/* Category Filter - Compact */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-hide">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${!activeCategory ? 'bg-chile-accent-red text-white' : 'bg-white/10'}`}
              >
                Alle ({selectedLocation.recommendations.length})
              </button>
              {categories.map(cat => {
                const count = selectedLocation.recommendations.filter(r => r.category === cat).length
                const label = CATEGORY_LABELS[cat.toLowerCase()] || cat
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex items-center gap-1 ${activeCategory === cat ? 'bg-chile-accent-teal text-white' : 'bg-white/10'}`}
                  >
                    <span>{CATEGORY_ICONS[cat] || CATEGORY_ICONS[cat.toLowerCase()] || '📍'}</span>
                    <span>{label}</span>
                    <span className="opacity-60">({count})</span>
                  </button>
                )
              })}
            </div>

            {/* Recommendations List - Compact */}
            <div className="space-y-2">
              {filteredRecommendations.map(rec => (
                <div 
                  key={rec.id}
                  id={`rec-${rec.id}`}
                  className={`
                    p-2.5 rounded-lg transition-all
                    ${selectedRecommendation?.id === rec.id ? 'recommendation-highlighted ring-1 ring-chile-accent-red' : 'bg-white/5'}
                    ${visited.has(rec.id) ? 'border-l-2 border-green-500' : ''}
                  `}
                  onClick={() => handleRecommendationSelect(rec)}
                >
                  <div className="flex items-center gap-2">
                    {/* Category Icon - Smaller */}
                    <span className="text-lg flex-shrink-0">{CATEGORY_ICONS[rec.category] || '📍'}</span>
                    
                    {/* Content - Compact */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-sm truncate">{rec.name}</span>
                        {visited.has(rec.id) && <span className="text-green-400 text-xs">✓</span>}
                      </div>
                      <div className="text-xs text-chile-text-muted truncate">
                        {CATEGORY_LABELS[rec.category.toLowerCase()] || rec.category}{rec.priceRange && ` • ${rec.priceRange}`}
                      </div>
                    </div>

                    {/* Actions - Side by side */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(rec.id)
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${favorites.has(rec.id) ? 'bg-red-500' : 'bg-white/10'}`}
                      >
                        {favorites.has(rec.id) ? '❤️' : '🤍'}
                      </button>
                      <a
                        href={getGoogleMapsSearchUrl(rec.name, selectedLocation?.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-7 h-7 rounded-full bg-white flex items-center justify-center"
                        title="In Google Maps suchen"
                      >
                        <svg viewBox="0 0 48 48" className="w-4 h-4">
                          <path fill="#48b564" d="M35.76,26.36h0.01c0,0-3.77,5.53-6.94,9.64c-2.74,3.55-3.54,6.59-3.77,8.06c-0.21,1.36-0.66,3.94-1.02,3.94c-0.36,0-0.81-2.59-1.02-3.94c-0.23-1.47-1.03-4.51-3.77-8.06c-3.17-4.11-6.95-9.64-6.95-9.64S8,20.45,8,16c0-7.73,6.27-14,14-14s14,6.27,14,14C36,20.45,35.76,26.36,35.76,26.36z"/>
                          <path fill="#378b55" d="M31.77,27.31l-8.08,8.08c0.58-0.2,1.2-0.28,1.83-0.14c0.61,0.13,1.17,0.46,1.61,0.9l8.08-8.08C34.18,27.22,32.8,26.95,31.77,27.31z"/>
                          <path fill="#48b564" d="M28.22,35.64l-8.08,8.08c0.37,0.71,0.68,1.36,0.92,1.89l8.08-8.08C28.78,36.87,28.47,36.22,28.22,35.64z"/>
                          <circle cx="22" cy="16" r="5" fill="#fff"/>
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Expanded detail when selected - Compact */}
                  {selectedRecommendation?.id === rec.id && (
                    <div className="mt-2 pt-2 border-t border-white/10 space-y-1.5 text-xs">
                      {rec.description && (
                        <p className="text-chile-text-secondary">{rec.description}</p>
                      )}
                      {rec.address && (
                        <div>
                          <span className="text-chile-text-muted">📍 </span>
                          {rec.address}
                        </div>
                      )}
                      {rec.openingHours && (
                        <div>
                          <span className="text-chile-text-muted">🕐 </span>
                          {rec.openingHours}
                        </div>
                      )}
                      {rec.mustTry && rec.mustTry.length > 0 && (
                        <div>
                          <span className="text-chile-text-muted">⭐ </span>
                          {rec.mustTry.join(', ')}
                        </div>
                      )}
                      {rec.source && (
                        <div className="flex items-center gap-1">
                          <span className="text-chile-text-muted">ℹ️</span>
                          <span className="text-chile-text-muted italic">{rec.source}</span>
                        </div>
                      )}
                      {notes[rec.id] && (
                        <div className="bg-chile-accent-teal/20 text-chile-accent-teal px-2 py-1 rounded">
                          📝 {notes[rec.id]}
                        </div>
                      )}
                      
                      {/* Actions Row - Compact */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleVisited(rec.id)
                          }}
                          className={`flex-1 py-1.5 rounded text-xs ${visited.has(rec.id) ? 'bg-green-500 text-white' : 'bg-white/10'}`}
                        >
                          {visited.has(rec.id) ? '✅ Besucht' : '☐ Besucht'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const note = prompt('Notiz:', notes[rec.id] || '')
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
                          className="px-3 py-1.5 rounded text-xs bg-white/10"
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

      {/* FACTS MODAL */}
      {showFacts && (
        <div className="absolute inset-0 z-[700] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowFacts(false)}
          />
          
          {/* Facts Card */}
          <div className="relative bg-chile-bg-card/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 max-w-md w-full max-h-[80vh] overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📖</span>
                <div>
                  <h2 className="font-bold text-lg">Chile Fakten</h2>
                  <p className="text-xs text-chile-text-muted">
                    {selectedLocation ? `${selectedLocation.name} & Allgemein` : 'Alle Fakten'} • {locationFacts.length} verfügbar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFacts(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Fact Content */}
            <div className="p-6">
              {locationFacts.length > 0 && (
                <div className="space-y-4">
                  {/* Category Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${locationFacts[currentFactIndex]?.category === 'nature' ? 'bg-green-500/20 text-green-400' : ''}
                      ${locationFacts[currentFactIndex]?.category === 'history' ? 'bg-amber-500/20 text-amber-400' : ''}
                      ${locationFacts[currentFactIndex]?.category === 'culture' ? 'bg-purple-500/20 text-purple-400' : ''}
                      ${locationFacts[currentFactIndex]?.category === 'food' ? 'bg-orange-500/20 text-orange-400' : ''}
                      ${locationFacts[currentFactIndex]?.category === 'geography' ? 'bg-blue-500/20 text-blue-400' : ''}
                      ${locationFacts[currentFactIndex]?.category === 'unique' ? 'bg-pink-500/20 text-pink-400' : ''}
                      ${locationFacts[currentFactIndex]?.category === 'beach' ? 'bg-cyan-500/20 text-cyan-400' : ''}
                    `}>
                      {locationFacts[currentFactIndex]?.category === 'nature' && '🌲 Natur'}
                      {locationFacts[currentFactIndex]?.category === 'history' && '🏰 Geschichte'}
                      {locationFacts[currentFactIndex]?.category === 'culture' && '🎭 Kultur'}
                      {locationFacts[currentFactIndex]?.category === 'food' && '🍽️ Essen'}
                      {locationFacts[currentFactIndex]?.category === 'geography' && '🌍 Geographie'}
                      {locationFacts[currentFactIndex]?.category === 'unique' && '⭐ Besonders'}
                      {locationFacts[currentFactIndex]?.category === 'beach' && '🏖️ Strand'}
                    </span>
                    {locationFacts[currentFactIndex]?.location && (
                      <span className="text-xs text-chile-text-muted">
                        📍 {tripData.locations.find(l => l.id === locationFacts[currentFactIndex]?.location)?.name || locationFacts[currentFactIndex]?.location}
                      </span>
                    )}
                  </div>

                  {/* Fact Text */}
                  <p className="text-lg leading-relaxed">
                    {locationFacts[currentFactIndex]?.text}
                  </p>

                  {/* Source */}
                  {locationFacts[currentFactIndex]?.source && (
                    <p className="text-xs text-chile-text-muted italic">
                      Quelle: {locationFacts[currentFactIndex]?.source}
                    </p>
                  )}

                  {/* Counter */}
                  <div className="text-center text-sm text-chile-text-muted">
                    {currentFactIndex + 1} / {locationFacts.length}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="px-4 py-3 border-t border-white/10 flex gap-2">
              <button
                onClick={() => setCurrentFactIndex(prev => prev > 0 ? prev - 1 : locationFacts.length - 1)}
                className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                ← Zurück
              </button>
              <button
                onClick={() => setCurrentFactIndex(Math.floor(Math.random() * locationFacts.length))}
                className="px-4 py-2 rounded-lg bg-chile-accent-teal hover:bg-chile-accent-teal/80 transition-colors"
              >
                🎲
              </button>
              <button
                onClick={() => setCurrentFactIndex(prev => prev < locationFacts.length - 1 ? prev + 1 : 0)}
                className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                Weiter →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CAR RENTAL PAGE */}
      {showCarRental && (
        <Suspense fallback={<div className="absolute inset-0 z-[700] bg-chile-bg-primary flex items-center justify-center"><div className="animate-spin text-3xl">🚗</div></div>}>
          <CarRentalPage onClose={() => setShowCarRental(false)} />
        </Suspense>
      )}

      {/* SETTINGS PAGE */}
      {showSettings && (
        <Suspense fallback={<div className="absolute inset-0 z-[700] bg-chile-bg-primary flex items-center justify-center"><div className="animate-spin text-3xl">⚙️</div></div>}>
          <SettingsPage onClose={() => setShowSettings(false)} />
        </Suspense>
      )}

      {/* Click outside to close dropdowns */}
      {(showLocationPicker || showMenu || showSearchResults) && (
        <div 
          className="absolute inset-0 z-[550]"
          onClick={() => {
            setShowLocationPicker(false)
            setShowMenu(false)
            setShowSearchResults(false)
          }}
        />
      )}
    </div>
  )
}

export default App
