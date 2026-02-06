import { useState, useEffect, useRef } from 'react'
import { Location, Recommendation } from '../App'
import WeatherWidget from './WeatherWidget'

// Storage keys
const FAVORITES_KEY = 'chile-trip-favorites'
const NOTES_KEY = 'chile-trip-notes'
const VISITED_KEY = 'chile-trip-visited'

// Category colors mapping
const categoryColors: Record<string, string> = {
  restaurant: '#ff6b6b',
  hiking: '#4ecdc4',
  event: '#ffe66d',
  museum: '#95e1d3',
  nature: '#38b000',
  unique: '#ff9f1c',
  art: '#c77dff',
  hotspring: '#ff8fab',
  beach: '#00b4d8',
  winery: '#9d4edd',
  historical: '#d4a373',
  viewpoint: '#ffd60a',
  shopping: '#f72585',
}

// Category icons mapping
const categoryIcons: Record<string, string> = {
  restaurant: '🍽️',
  hiking: '🥾',
  event: '🎪',
  museum: '🏛️',
  nature: '🌲',
  unique: '⭐',
  art: '🎨',
  hotspring: '♨️',
  beach: '🏖️',
  winery: '🍷',
  historical: '🏰',
  viewpoint: '👁️',
  shopping: '🛍️',
}

interface LocationPanelProps {
  location: Location
  selectedRecommendation: Recommendation | null
  onRecommendationSelect: (recommendation: Recommendation) => void
  activeCategory: string | null
  onCategoryChange: (category: string | null) => void
}

export default function LocationPanel({
  location,
  selectedRecommendation,
  onRecommendationSelect,
  activeCategory,
  onCategoryChange
}: LocationPanelProps) {
  // Favorites state (persisted to localStorage)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY)
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })
  
  // Notes state (persisted to localStorage)
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(NOTES_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  
  // Visited state (persisted to localStorage)
  const [visited, setVisited] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(VISITED_KEY)
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })
  
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showVisitedOnly, setShowVisitedOnly] = useState(false)
  const [hideVisited, setHideVisited] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingNote, setEditingNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const noteInputRef = useRef<HTMLTextAreaElement>(null)

  // Persist favorites to localStorage
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]))
  }, [favorites])
  
  // Persist notes to localStorage
  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
  }, [notes])
  
  // Persist visited to localStorage
  useEffect(() => {
    localStorage.setItem(VISITED_KEY, JSON.stringify([...visited]))
  }, [visited])

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Don't trigger card click
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

  const toggleVisited = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Don't trigger card click
    setVisited(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const startEditingNote = (id: string) => {
    setNoteText(notes[id] || '')
    setEditingNote(true)
    setTimeout(() => noteInputRef.current?.focus(), 50)
  }

  const saveNote = (id: string) => {
    const trimmed = noteText.trim()
    setNotes(prev => {
      const next = { ...prev }
      if (trimmed) {
        next[id] = trimmed
      } else {
        delete next[id]
      }
      return next
    })
    setEditingNote(false)
    setNoteText('')
  }

  const cancelNote = () => {
    setEditingNote(false)
    setNoteText('')
  }

  // Get all unique categories from location's recommendations
  const categories = Array.from(new Set(location.recommendations.map(r => r.category)))
  
  // Count favorites for this location
  const locationFavoritesCount = location.recommendations.filter(r => favorites.has(r.id)).length
  
  // Count visited for this location
  const locationVisitedCount = location.recommendations.filter(r => visited.has(r.id)).length

  // Reset search and note editing when location changes
  useEffect(() => {
    setSearchQuery('')
    setEditingNote(false)
    setNoteText('')
  }, [location.id])
  
  // Reset note editing when selected recommendation changes
  useEffect(() => {
    setEditingNote(false)
    setNoteText('')
  }, [selectedRecommendation?.id])

  // Filter recommendations by active category, favorites, visited, and search
  const filteredRecommendations = location.recommendations.filter(rec => {
    const matchesCategory = !activeCategory || rec.category === activeCategory
    const matchesFavorites = !showFavoritesOnly || favorites.has(rec.id)
    const matchesVisited = !showVisitedOnly || visited.has(rec.id)
    const notHiddenVisited = !hideVisited || !visited.has(rec.id)
    
    // Search matching
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch = !query || 
      rec.name.toLowerCase().includes(query) ||
      rec.nameEs?.toLowerCase().includes(query) ||
      rec.description?.toLowerCase().includes(query) ||
      rec.tags?.some(tag => tag.toLowerCase().includes(query)) ||
      rec.category.toLowerCase().includes(query) ||
      rec.address?.toLowerCase().includes(query)
    
    return matchesCategory && matchesFavorites && matchesVisited && notHiddenVisited && matchesSearch
  })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Location Header */}
      <div className="p-4 border-b border-chile-bg-secondary">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{location.name}</h2>
            <p className="text-sm text-chile-text-secondary">{location.nameEs}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">
              {formatDate(location.startDate)} - {formatDate(location.endDate)}
            </div>
            <div className="text-sm text-chile-text-secondary">
              {location.durationDays} days • {location.type}
            </div>
          </div>
        </div>
        <p className="mt-2 text-chile-text-secondary">{location.description}</p>
        <div className="mt-3 flex items-center flex-wrap gap-2">
          <span className="px-3 py-1 text-sm rounded-full bg-chile-bg-card">
            {location.recommendations.length} recommendations
          </span>
          <WeatherWidget 
            locationName={location.name}
            coordinates={location.coordinates as [number, number]}
            dates={{ start: location.startDate, end: location.endDate }}
          />
        </div>
      </div>

      {/* Search Input */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recommendations..."
            className="w-full px-4 py-2 pl-10 rounded-lg bg-chile-bg-card border border-chile-bg-secondary focus:border-chile-accent-teal focus:ring-1 focus:ring-chile-accent-teal outline-none transition-colors text-sm"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-chile-text-muted">
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-chile-text-muted hover:text-chile-text-primary transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="px-4 pb-4 border-b border-chile-bg-secondary">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange(null)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${!activeCategory && !showFavoritesOnly ? 'bg-chile-accent-red' : 'bg-chile-bg-card hover:bg-chile-bg-secondary'}`}
          >
            All
          </button>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${showFavoritesOnly ? 'bg-red-500 bg-opacity-20 text-red-400' : 'bg-chile-bg-card hover:bg-chile-bg-secondary'}`}
          >
            <span>{showFavoritesOnly ? '❤️' : '🤍'}</span>
            <span>Favorites</span>
            {locationFavoritesCount > 0 && (
              <span className="text-xs opacity-70">({locationFavoritesCount})</span>
            )}
          </button>
          <button
            onClick={() => {
              if (showVisitedOnly) {
                setShowVisitedOnly(false)
              } else if (hideVisited) {
                setHideVisited(false)
              } else {
                setShowVisitedOnly(true)
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              setHideVisited(!hideVisited)
              setShowVisitedOnly(false)
            }}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
              showVisitedOnly ? 'bg-green-500 bg-opacity-20 text-green-400' : 
              hideVisited ? 'bg-chile-accent-purple bg-opacity-20 text-chile-accent-purple' :
              'bg-chile-bg-card hover:bg-chile-bg-secondary'
            }`}
            title="Click: show visited only | Right-click: hide visited"
          >
            <span>{showVisitedOnly ? '✅' : hideVisited ? '🙈' : '☑️'}</span>
            <span>{hideVisited ? 'Hidden' : 'Visited'}</span>
            {locationVisitedCount > 0 && (
              <span className="text-xs opacity-70">({locationVisitedCount})</span>
            )}
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${activeCategory === category ? 'bg-opacity-20' : 'bg-chile-bg-card hover:bg-chile-bg-secondary'}`}
              style={{
                backgroundColor: activeCategory === category ? `${categoryColors[category]}20` : undefined,
                color: activeCategory === category ? categoryColors[category] : undefined,
              }}
            >
              <span>{categoryIcons[category] || '📍'}</span>
              <span>{category}</span>
              <span className="text-xs opacity-70">
                ({location.recommendations.filter(r => r.category === category).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">
            {searchQuery ? 'Search Results' : 'Recommendations'}
            {activeCategory && ` • ${activeCategory}`}
          </h3>
          <span className="text-sm text-chile-text-secondary">
            {filteredRecommendations.length} of {location.recommendations.length}
          </span>
        </div>
        
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-8 text-chile-text-secondary">
            {searchQuery 
              ? `No results for "${searchQuery}"` 
              : 'No recommendations in this category'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecommendations.map(recommendation => (
              <div
                key={recommendation.id}
                onClick={() => onRecommendationSelect(recommendation)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedRecommendation?.id === recommendation.id 
                    ? 'ring-2 ring-chile-accent-red' 
                    : visited.has(recommendation.id)
                      ? 'bg-green-900/20 hover:bg-green-900/30 border border-green-600/30'
                      : 'bg-chile-bg-card hover:bg-chile-bg-secondary'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${categoryColors[recommendation.category]}20` }}
                  >
                    <span style={{ color: categoryColors[recommendation.category] }}>
                      {categoryIcons[recommendation.category] || '📍'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{recommendation.name}</h4>
                        <p className="text-sm text-chile-text-secondary">{recommendation.nameEs}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {notes[recommendation.id] && (
                          <span 
                            className="text-xs opacity-70" 
                            title="Has note"
                          >
                            📝
                          </span>
                        )}
                        {recommendation.priceRange && (
                          <span className="text-xs px-2 py-1 rounded bg-chile-bg-secondary">
                            {recommendation.priceRange}
                          </span>
                        )}
                        <button
                          onClick={(e) => toggleVisited(recommendation.id, e)}
                          className="text-lg hover:scale-110 transition-transform"
                          title={visited.has(recommendation.id) ? 'Mark as not visited' : 'Mark as visited'}
                        >
                          {visited.has(recommendation.id) ? '✅' : '☑️'}
                        </button>
                        <button
                          onClick={(e) => toggleFavorite(recommendation.id, e)}
                          className="text-lg hover:scale-110 transition-transform"
                          title={favorites.has(recommendation.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {favorites.has(recommendation.id) ? '❤️' : '🤍'}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm mt-2 line-clamp-2">{recommendation.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {recommendation.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-xs rounded bg-chile-bg-secondary">
                          #{tag}
                        </span>
                      ))}
                      {recommendation.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-xs rounded bg-chile-bg-secondary">
                          +{recommendation.tags.length - 3}
                        </span>
                      )}
                    </div>
                    {recommendation.address && (
                      <p className="text-xs text-chile-text-muted mt-2 flex items-center gap-1">
                        📍 {recommendation.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Recommendation Details */}
      {selectedRecommendation && (
        <div className="border-t border-chile-bg-secondary p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{selectedRecommendation.name}</h3>
              {visited.has(selectedRecommendation.id) && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-600/20 text-green-400">✓ Visited</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => toggleVisited(selectedRecommendation.id, e)}
                className="text-xl hover:scale-110 transition-transform"
                title={visited.has(selectedRecommendation.id) ? 'Mark as not visited' : 'Mark as visited'}
              >
                {visited.has(selectedRecommendation.id) ? '✅' : '☑️'}
              </button>
              <button
                onClick={(e) => toggleFavorite(selectedRecommendation.id, e)}
                className="text-xl hover:scale-110 transition-transform"
                title={favorites.has(selectedRecommendation.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {favorites.has(selectedRecommendation.id) ? '❤️' : '🤍'}
              </button>
              <button 
                onClick={() => onRecommendationSelect(selectedRecommendation)}
                className="text-chile-text-secondary hover:text-chile-text-primary"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span 
                className="px-2 py-1 text-xs rounded"
                style={{ 
                  backgroundColor: `${categoryColors[selectedRecommendation.category]}20`,
                  color: categoryColors[selectedRecommendation.category]
                }}
              >
                {categoryIcons[selectedRecommendation.category]} {selectedRecommendation.category}
              </span>
              {selectedRecommendation.priceRange && (
                <span className="px-2 py-1 text-xs rounded bg-chile-bg-secondary">
                  💰 {selectedRecommendation.priceRange}
                </span>
              )}
            </div>
            <p className="text-sm">{selectedRecommendation.description}</p>
            {selectedRecommendation.descriptionEs && (
              <p className="text-sm text-chile-text-secondary italic">
                {selectedRecommendation.descriptionEs}
              </p>
            )}
            {selectedRecommendation.address && (
              <div className="text-sm">
                <span className="font-medium">Address:</span> {selectedRecommendation.address}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {selectedRecommendation.tags.map((tag, idx) => (
                <span key={idx} className="px-2 py-1 text-xs rounded bg-chile-bg-secondary">
                  #{tag}
                </span>
              ))}
            </div>
            
            {/* Personal Notes Section */}
            <div className="pt-2 border-t border-chile-bg-secondary">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-1">
                  📝 Personal Note
                </span>
                {!editingNote && (
                  <button
                    onClick={() => startEditingNote(selectedRecommendation.id)}
                    className="text-xs px-2 py-1 rounded bg-chile-bg-card hover:bg-chile-bg-secondary transition-colors"
                  >
                    {notes[selectedRecommendation.id] ? 'Edit' : 'Add note'}
                  </button>
                )}
              </div>
              
              {editingNote ? (
                <div className="space-y-2">
                  <textarea
                    ref={noteInputRef}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add your personal notes here... (reservations, tips, what to order, etc.)"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-chile-bg-card border border-chile-bg-secondary focus:border-chile-accent-teal focus:ring-1 focus:ring-chile-accent-teal outline-none transition-colors resize-none"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') cancelNote()
                      if (e.key === 'Enter' && e.metaKey) saveNote(selectedRecommendation.id)
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelNote}
                      className="text-xs px-3 py-1.5 rounded bg-chile-bg-card hover:bg-chile-bg-secondary transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveNote(selectedRecommendation.id)}
                      className="text-xs px-3 py-1.5 rounded bg-chile-accent-teal hover:bg-opacity-90 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : notes[selectedRecommendation.id] ? (
                <div 
                  className="text-sm p-2 rounded bg-chile-bg-card border-l-2 border-chile-accent-teal cursor-pointer hover:bg-chile-bg-secondary transition-colors"
                  onClick={() => startEditingNote(selectedRecommendation.id)}
                  title="Click to edit"
                >
                  {notes[selectedRecommendation.id]}
                </div>
              ) : (
                <p className="text-xs text-chile-text-muted italic">
                  No notes yet. Add reservations, tips, or reminders!
                </p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedRecommendation.website && (
                <a 
                  href={selectedRecommendation.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-sm rounded-lg bg-chile-bg-card hover:bg-chile-bg-secondary transition-colors"
                >
                  🔗 Website
                </a>
              )}
              <a 
                href={selectedRecommendation.googleMapsLink || `https://maps.google.com/?q=${selectedRecommendation.coordinates[0]},${selectedRecommendation.coordinates[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm rounded-lg bg-chile-accent-red hover:bg-opacity-90 transition-colors"
              >
                📍 Google Maps
              </a>
              <button
                onClick={() => {
                  const link = selectedRecommendation.googleMapsLink || `https://maps.google.com/?q=${selectedRecommendation.coordinates[0]},${selectedRecommendation.coordinates[1]}`
                  navigator.clipboard.writeText(link)
                  // Brief visual feedback
                  const btn = document.activeElement as HTMLButtonElement
                  const originalText = btn.innerText
                  btn.innerText = '✓ Copied!'
                  setTimeout(() => { btn.innerText = originalText }, 1500)
                }}
                className="px-3 py-1.5 text-sm rounded-lg bg-chile-bg-card hover:bg-chile-bg-secondary transition-colors"
              >
                📋 Copy Link
              </button>
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  onClick={async () => {
                    const link = selectedRecommendation.googleMapsLink || `https://maps.google.com/?q=${selectedRecommendation.coordinates[0]},${selectedRecommendation.coordinates[1]}`
                    const noteText = notes[selectedRecommendation.id]
                    try {
                      await navigator.share({
                        title: `${selectedRecommendation.name} - Chile Trip`,
                        text: `${categoryIcons[selectedRecommendation.category]} ${selectedRecommendation.name}\n${selectedRecommendation.description}${noteText ? `\n📝 ${noteText}` : ''}`,
                        url: link
                      })
                    } catch (err) {
                      // User cancelled or share failed
                    }
                  }}
                  className="px-3 py-1.5 text-sm rounded-lg bg-chile-accent-teal hover:bg-opacity-90 transition-colors"
                >
                  📤 Share
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
