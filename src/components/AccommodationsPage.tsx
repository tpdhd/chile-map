import { useState, useMemo, useEffect } from 'react'
import accommodationsPart1 from '../data/accommodations-part1.json'
import accommodationsPart2 from '../data/accommodations-part2.json'

interface AccommodationsPageProps {
  onClose: () => void
  onSelectAccommodation?: (accommodation: Accommodation & { locationKey: string }) => void
}

interface Accommodation {
  id: string
  name: string
  type: string
  coordinates: [number, number]
  description: string
  priceRange: string
  priceEstimate: string
  rating: number
  ratingSource: string
  amenities: string[]
  googleMapsLink: string
  bookingLink: string
  airbnbLink: string
  website: string
  phone: string
  imageUrl: string
  source: string
  sourceNote: string
}

interface AccommodationsData {
  accommodations: {
    [key: string]: Accommodation[]
  }
}

// Amenity Icons
const AMENITY_ICONS: Record<string, string> = {
  'wifi': '📶',
  'kitchen': '🍳',
  'parking': '🅿️',
  'pool': '🏊',
  'breakfast': '🥐',
  'air-conditioning': '❄️',
  'heating': '🔥',
  'terrace': '🌅',
  'balcony': '🪟',
  'view': '👁️',
  'bbq': '🔥',
  'hot-tub': '♨️',
  'sauna': '🧖',
  'gym': '💪',
  'restaurant': '🍽️',
  'bar': '🍺',
  'washer': '🧺',
  'dryer': '👕',
  'central-location': '📍',
  'beach-access': '🏖️',
  'volcano-view': '🌋',
  'lake-view': '💙',
  'mountain-view': '⛰️',
  'river-view': '🏞️',
  'sea-view': '🌊',
  'garden': '🌳',
  'fireplace': '🔥',
  'family-friendly': '👨‍👩‍👧‍👦',
  'pet-friendly': '🐕',
}

// Location Names (German)
const LOCATION_NAMES: Record<string, string> = {
  'santiago': 'Santiago',
  'quillimari': 'Quillimari',
  'algarrobo': 'Algarrobo',
  'wine-resort': 'Weinregion',
  'san-carlos': 'San Carlos',
  'chillan': 'Chillán',
  'conguillio': 'Conguillío',
  'pucon': 'Pucón',
  'valdivia': 'Valdivia',
  'osorno': 'Osorno',
  'puerto-montt': 'Puerto Montt',
  'chiloe': 'Chiloé',
}

// Type translations
const TYPE_NAMES: Record<string, string> = {
  'apartment': 'Apartment',
  'hotel': 'Hotel',
  'hostel': 'Hostel',
  'cabana': 'Cabaña',
  'house': 'Haus',
  'cabin': 'Hütte',
}

const FAVORITES_KEY = 'chile-accommodations-favorites'

export default function AccommodationsPage({ onClose, onSelectAccommodation }: AccommodationsPageProps) {
  // Merge both JSON files
  const allAccommodations = useMemo(() => {
    const part1 = accommodationsPart1 as unknown as AccommodationsData
    const part2 = accommodationsPart2 as unknown as AccommodationsData
    
    const merged: AccommodationsData = {
      accommodations: {
        ...part1.accommodations,
        ...part2.accommodations,
      }
    }
    
    return merged
  }, [])

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(FAVORITES_KEY)
    return saved ? new Set(JSON.parse(saved)) : new Set()
  })
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterPriceRange, setFilterPriceRange] = useState<string | null>(null)
  const [filterMinRating, setFilterMinRating] = useState<number>(0)
  const [filterAmenities, setFilterAmenities] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating-desc' | 'name-asc'>('rating-desc')
  const [showFilters, setShowFilters] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)))
  }, [favorites])

  // Get all locations
  const locations = Object.keys(allAccommodations.accommodations)

  // Get all unique types
  const allTypes = useMemo(() => {
    const types = new Set<string>()
    locations.forEach(loc => {
      allAccommodations.accommodations[loc].forEach(acc => {
        types.add(acc.type)
      })
    })
    return Array.from(types).sort()
  }, [allAccommodations, locations])

  // Get all unique amenities
  const allAmenities = useMemo(() => {
    const amenities = new Set<string>()
    locations.forEach(loc => {
      allAccommodations.accommodations[loc].forEach(acc => {
        acc.amenities.forEach(a => amenities.add(a))
      })
    })
    return Array.from(amenities).sort()
  }, [allAccommodations, locations])

  // Get accommodations for selected location (or all)
  const currentAccommodations = useMemo(() => {
    if (!selectedLocation) {
      // Flatten all accommodations with location info
      return locations.flatMap(loc =>
        allAccommodations.accommodations[loc].map(acc => ({
          ...acc,
          locationKey: loc,
        }))
      )
    }
    return allAccommodations.accommodations[selectedLocation]?.map(acc => ({
      ...acc,
      locationKey: selectedLocation,
    })) || []
  }, [selectedLocation, allAccommodations, locations])

  // Apply filters and sorting
  const filteredAccommodations = useMemo(() => {
    let filtered = currentAccommodations

    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(acc => favorites.has(acc.id))
    }

    // Type filter
    if (filterType) {
      filtered = filtered.filter(acc => acc.type === filterType)
    }

    // Price range filter
    if (filterPriceRange) {
      filtered = filtered.filter(acc => acc.priceRange === filterPriceRange)
    }

    // Rating filter
    if (filterMinRating > 0) {
      filtered = filtered.filter(acc => acc.rating >= filterMinRating)
    }

    // Amenities filter (all selected must be present)
    if (filterAmenities.size > 0) {
      filtered = filtered.filter(acc =>
        Array.from(filterAmenities).every(amenity => acc.amenities.includes(amenity))
      )
    }

    // Sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.priceRange.localeCompare(b.priceRange)
        case 'price-desc':
          return b.priceRange.localeCompare(a.priceRange)
        case 'rating-desc':
          return b.rating - a.rating
        case 'name-asc':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
  }, [currentAccommodations, filterType, filterPriceRange, filterMinRating, filterAmenities, sortBy, showFavoritesOnly, favorites])

  // Statistics
  const stats = useMemo(() => {
    const totalAccommodations = locations.reduce(
      (sum, loc) => sum + allAccommodations.accommodations[loc].length,
      0
    )
    const totalLocations = locations.length
    
    const avgPrice = currentAccommodations.reduce((sum, acc) => {
      // Extract numeric price from priceEstimate (e.g., "~55-65€/Nacht für 3P")
      const match = acc.priceEstimate.match(/(\d+)-(\d+)/)
      if (match) {
        return sum + (parseInt(match[1]) + parseInt(match[2])) / 2
      }
      return sum
    }, 0) / (currentAccommodations.length || 1)

    const avgRating = currentAccommodations.reduce((sum, acc) => sum + acc.rating, 0) / (currentAccommodations.length || 1)

    const budgetCount = currentAccommodations.filter(acc => acc.priceRange === '$').length
    const midCount = currentAccommodations.filter(acc => acc.priceRange === '$$').length
    const premiumCount = currentAccommodations.filter(acc => acc.priceRange === '$$$').length

    return {
      totalAccommodations,
      totalLocations,
      avgPrice: Math.round(avgPrice),
      avgRating: avgRating.toFixed(1),
      budgetCount,
      midCount,
      premiumCount,
      favoriteCount: favorites.size,
    }
  }, [currentAccommodations, allAccommodations, locations, favorites])

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleAmenityFilter = (amenity: string) => {
    setFilterAmenities(prev => {
      const next = new Set(prev)
      if (next.has(amenity)) {
        next.delete(amenity)
      } else {
        next.add(amenity)
      }
      return next
    })
  }

  const resetFilters = () => {
    setFilterType(null)
    setFilterPriceRange(null)
    setFilterMinRating(0)
    setFilterAmenities(new Set())
    setShowFavoritesOnly(false)
  }

  const hasActiveFilters = filterType || filterPriceRange || filterMinRating > 0 || filterAmenities.size > 0 || showFavoritesOnly

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
          <h1 className="font-bold text-lg">🏠 Unterkünfte</h1>
          <p className="text-xs text-chile-text-muted truncate">
            {stats.totalAccommodations} Unterkünfte • {stats.totalLocations} Orte
            {selectedLocation && ` • ${LOCATION_NAMES[selectedLocation]}`}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
            hasActiveFilters ? 'bg-chile-accent-red text-white' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          🔍
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Stats Overview */}
        <div className="mx-4 mt-4 p-4 rounded-xl bg-gradient-to-br from-chile-accent-red/20 to-chile-accent-teal/10 border border-chile-accent-red/30">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-white/5 text-center">
              <div className="text-2xl font-bold text-chile-accent-teal">{filteredAccommodations.length}</div>
              <div className="text-[10px] text-chile-text-muted">Ergebnisse</div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 text-center">
              <div className="text-2xl font-bold text-amber-400">~{stats.avgPrice}€</div>
              <div className="text-[10px] text-chile-text-muted">Ø Preis/Nacht</div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.avgRating}</div>
              <div className="text-[10px] text-chile-text-muted">Ø Rating</div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.favoriteCount}</div>
              <div className="text-[10px] text-chile-text-muted">Favoriten</div>
            </div>
          </div>
          {/* Price Distribution */}
          <div className="pt-3 border-t border-white/10">
            <div className="text-xs font-bold text-chile-text-muted mb-2">Budget-Verteilung</div>
            <div className="flex gap-2">
              <div className="flex-1 p-2 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                <div className="text-sm font-bold text-green-400">{stats.budgetCount}</div>
                <div className="text-[9px] text-chile-text-muted">Budget $</div>
              </div>
              <div className="flex-1 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
                <div className="text-sm font-bold text-amber-400">{stats.midCount}</div>
                <div className="text-[9px] text-chile-text-muted">Mittel $$</div>
              </div>
              <div className="flex-1 p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-center">
                <div className="text-sm font-bold text-purple-400">{stats.premiumCount}</div>
                <div className="text-[9px] text-chile-text-muted">Premium $$$</div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Navigation */}
        <div className="px-4 py-3">
          <div className="text-xs font-bold text-chile-text-muted uppercase tracking-wide mb-2">Ort auswählen</div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            <button
              onClick={() => setSelectedLocation(null)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                selectedLocation === null ? 'bg-chile-accent-red text-white' : 'bg-white/10'
              }`}
            >
              Alle Orte
            </button>
            {locations.map(loc => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                  selectedLocation === loc ? 'bg-chile-accent-red text-white' : 'bg-white/10'
                }`}
              >
                {LOCATION_NAMES[loc] || loc} ({allAccommodations.accommodations[loc].length})
              </button>
            ))}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mx-4 mb-3 p-4 rounded-xl bg-chile-bg-card border border-white/10 space-y-3">
            {/* Favorites Toggle */}
            <div>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  showFavoritesOnly ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-chile-text-secondary'
                }`}
              >
                ⭐ Nur Favoriten zeigen
              </button>
            </div>

            {/* Type Filter */}
            <div>
              <div className="text-xs font-bold text-chile-text-muted mb-2">Typ</div>
              <div className="flex flex-wrap gap-1.5">
                {allTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(filterType === type ? null : type)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      filterType === type ? 'bg-chile-accent-teal text-white' : 'bg-white/5 text-chile-text-secondary'
                    }`}
                  >
                    {TYPE_NAMES[type] || type}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <div className="text-xs font-bold text-chile-text-muted mb-2">Preisklasse</div>
              <div className="flex gap-2">
                {['$', '$$', '$$$'].map(range => (
                  <button
                    key={range}
                    onClick={() => setFilterPriceRange(filterPriceRange === range ? null : range)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterPriceRange === range ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-chile-text-secondary'
                    }`}
                  >
                    {range} {range === '$' && '(<40€)'} {range === '$$' && '(40-80€)'} {range === '$$$' && '(>80€)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <div className="text-xs font-bold text-chile-text-muted mb-2">Min. Rating: {filterMinRating.toFixed(1)}</div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filterMinRating}
                onChange={(e) => setFilterMinRating(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-chile-text-muted mt-1">
                <span>0</span>
                <span>2.5</span>
                <span>5</span>
              </div>
            </div>

            {/* Amenities Filter */}
            <div>
              <div className="text-xs font-bold text-chile-text-muted mb-2">Ausstattung</div>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {allAmenities.map(amenity => (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenityFilter(amenity)}
                    className={`px-2 py-1 rounded-full text-[10px] transition-all ${
                      filterAmenities.has(amenity) ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-chile-text-muted'
                    }`}
                  >
                    {AMENITY_ICONS[amenity] || '•'} {amenity}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting */}
            <div>
              <div className="text-xs font-bold text-chile-text-muted mb-2">Sortierung</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSortBy('rating-desc')}
                  className={`px-3 py-2 rounded-lg text-xs transition-all ${
                    sortBy === 'rating-desc' ? 'bg-chile-accent-red text-white' : 'bg-white/5 text-chile-text-secondary'
                  }`}
                >
                  ⭐ Rating ↓
                </button>
                <button
                  onClick={() => setSortBy('price-asc')}
                  className={`px-3 py-2 rounded-lg text-xs transition-all ${
                    sortBy === 'price-asc' ? 'bg-chile-accent-red text-white' : 'bg-white/5 text-chile-text-secondary'
                  }`}
                >
                  💰 Preis ↑
                </button>
                <button
                  onClick={() => setSortBy('price-desc')}
                  className={`px-3 py-2 rounded-lg text-xs transition-all ${
                    sortBy === 'price-desc' ? 'bg-chile-accent-red text-white' : 'bg-white/5 text-chile-text-secondary'
                  }`}
                >
                  💰 Preis ↓
                </button>
                <button
                  onClick={() => setSortBy('name-asc')}
                  className={`px-3 py-2 rounded-lg text-xs transition-all ${
                    sortBy === 'name-asc' ? 'bg-chile-accent-red text-white' : 'bg-white/5 text-chile-text-secondary'
                  }`}
                >
                  📝 Name A-Z
                </button>
              </div>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="w-full px-3 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-medium"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        )}

        {/* Accommodation Cards */}
        <div className="px-4 pb-6 space-y-3">
          {filteredAccommodations.length === 0 && (
            <div className="p-6 rounded-xl bg-white/5 text-center">
              <div className="text-4xl mb-2">🏠</div>
              <div className="text-sm text-chile-text-muted">
                Keine Unterkünfte gefunden. Versuche andere Filter.
              </div>
            </div>
          )}

          {filteredAccommodations.map(acc => {
            const isFavorite = favorites.has(acc.id)
            
            return (
              <div key={acc.id} className="p-3 rounded-xl bg-chile-bg-card border border-white/10 relative">
                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(acc.id)}
                  className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isFavorite ? 'bg-purple-500/30 text-purple-400 scale-110' : 'bg-white/10 text-chile-text-muted'
                  }`}
                >
                  {isFavorite ? '⭐' : '☆'}
                </button>

                {/* Header */}
                <div className="pr-10 mb-2">
                  <h3 className="font-bold text-base mb-1">{acc.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-chile-accent-teal/20 text-chile-accent-teal text-xs rounded-full">
                      {TYPE_NAMES[acc.type] || acc.type}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      acc.priceRange === '$' ? 'bg-green-500/20 text-green-400' :
                      acc.priceRange === '$$' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {acc.priceRange}
                    </span>
                    {!selectedLocation && (
                      <span className="px-2 py-0.5 bg-white/10 text-chile-text-muted text-xs rounded-full">
                        📍 {LOCATION_NAMES[acc.locationKey] || acc.locationKey}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-chile-text-secondary mb-3">{acc.description}</p>

                {/* Price & Rating */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <div className="text-xs text-chile-text-muted mb-0.5">Preis</div>
                    <div className="text-sm font-bold text-amber-400">{acc.priceEstimate}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <div className="text-xs text-chile-text-muted mb-0.5">Rating</div>
                    <div className="text-sm font-bold text-green-400">
                      {'⭐'.repeat(Math.round(acc.rating))} {acc.rating}
                    </div>
                    <div className="text-[9px] text-chile-text-muted">{acc.ratingSource}</div>
                  </div>
                </div>

                {/* Amenities */}
                {acc.amenities.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-bold text-chile-text-muted mb-1.5">Ausstattung</div>
                    <div className="flex flex-wrap gap-1">
                      {acc.amenities.slice(0, 8).map(amenity => (
                        <span key={amenity} className="px-2 py-0.5 bg-white/5 text-[10px] text-chile-text-muted rounded-full">
                          {AMENITY_ICONS[amenity] || '•'} {amenity}
                        </span>
                      ))}
                      {acc.amenities.length > 8 && (
                        <span className="px-2 py-0.5 bg-white/5 text-[10px] text-chile-text-muted rounded-full">
                          +{acc.amenities.length - 8} mehr
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Show on Map Button */}
                {onSelectAccommodation && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectAccommodation(acc)
                    }}
                    className="w-full mb-2 px-3 py-2.5 rounded-lg bg-chile-accent-teal/20 text-chile-accent-teal border border-chile-accent-teal/30 text-sm font-bold text-center hover:bg-chile-accent-teal/30 transition-colors"
                  >
                    📍 Auf Karte zeigen
                  </button>
                )}

                {/* Links */}
                <div className="flex flex-wrap gap-2">
                  <a
                    href={acc.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium text-center hover:bg-red-500/30 transition-colors"
                  >
                    🗺️ Maps
                  </a>
                  {acc.bookingLink && (
                    <a
                      href={acc.bookingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-medium text-center hover:bg-blue-500/30 transition-colors"
                    >
                      🏨 Booking
                    </a>
                  )}
                  {acc.airbnbLink && (
                    <a
                      href={acc.airbnbLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30 text-xs font-medium text-center hover:bg-pink-500/30 transition-colors"
                    >
                      🏠 Airbnb
                    </a>
                  )}
                </div>

                {/* Source Note */}
                {acc.sourceNote && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-chile-text-muted">
                    💡 {acc.sourceNote}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
