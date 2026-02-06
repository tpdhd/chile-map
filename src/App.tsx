import { useState, useEffect, Suspense, lazy } from 'react'
import Timeline from './components/Timeline'
import LocationPanel from './components/LocationPanel'
import { LoadingSkeleton, MapLoading } from './components/LoadingState'
import tripData from './data/trip-data.json'

// Lazy load the map for faster initial render
const Map = lazy(() => import('./components/Map'))

export type Location = typeof tripData.locations[0]
export type Recommendation = typeof tripData.locations[0]['recommendations'][0]

const FAVORITES_KEY = 'chile-trip-favorites'
const NOTES_KEY = 'chile-trip-notes'
const VISITED_KEY = 'chile-trip-visited'

// Emergency contacts for Chile
const EMERGENCY_INFO = {
  emergency: [
    { name: 'Emergencias (All)', number: '131', desc: 'Ambulancia, Bomberos, Policía' },
    { name: 'Carabineros (Police)', number: '133', desc: 'Policía Nacional' },
    { name: 'Bomberos (Fire)', number: '132', desc: 'Bomberos de Chile' },
    { name: 'Ambulancia (SAMU)', number: '131', desc: 'Servicio de Urgencia' },
  ],
  embassy: {
    name: 'Deutsche Botschaft Santiago',
    address: 'Las Hualtatas 5677, Vitacura, Santiago',
    phone: '+56 2 2463 2500',
    emergency: '+56 9 9137 7533',
    hours: 'Mo-Fr 8:30-11:30',
    web: 'santiago.diplo.de',
  },
  useful: [
    { name: 'Tourist Police', number: '+56 2 2961 2600' },
    { name: 'Road Emergency', number: '138' },
    { name: 'CONAF (Parks)', number: '+56 2 2663 0000' },
  ],
}

// Useful Spanish phrases for travel
const SPANISH_PHRASES = [
  { de: 'Hallo / Tschüss', es: 'Hola / Chao', pron: 'oh-la / tschau' },
  { de: 'Guten Morgen', es: 'Buenos días', pron: 'bwe-nos dee-as' },
  { de: 'Bitte / Danke', es: 'Por favor / Gracias', pron: 'por fa-vor / gra-sias' },
  { de: 'Ja / Nein', es: 'Sí / No', pron: 'see / no' },
  { de: 'Entschuldigung', es: 'Disculpe', pron: 'dis-kul-pe' },
  { de: 'Ich verstehe nicht', es: 'No entiendo', pron: 'no en-tyen-do' },
  { de: 'Sprechen Sie Englisch?', es: '¿Habla inglés?', pron: 'ab-la in-gles' },
  { de: 'Wie viel kostet das?', es: '¿Cuánto cuesta?', pron: 'kwan-to kwes-ta' },
  { de: 'Die Rechnung, bitte', es: 'La cuenta, por favor', pron: 'la kwen-ta' },
  { de: 'Wo ist...?', es: '¿Dónde está...?', pron: 'don-de es-ta' },
  { de: 'Das Badezimmer', es: 'El baño', pron: 'el ban-yo' },
  { de: 'Ich hätte gerne...', es: 'Quisiera...', pron: 'ki-sye-ra' },
  { de: 'Wasser / Bier / Wein', es: 'Agua / Cerveza / Vino', pron: 'a-gwa / ser-ve-sa / vee-no' },
  { de: 'Vegetarisch', es: 'Vegetariano', pron: 've-he-ta-rya-no' },
  { de: 'Ich brauche Hilfe', es: 'Necesito ayuda', pron: 'ne-se-si-to a-yu-da' },
  { de: 'Rufen Sie die Polizei', es: 'Llame a la policía', pron: 'ya-me a la po-li-si-a' },
  { de: 'Ich bin allergisch gegen...', es: 'Soy alérgico a...', pron: 'soy a-ler-hi-ko a' },
  { de: 'Links / Rechts / Geradeaus', es: 'Izquierda / Derecha / Recto', pron: 'is-kyer-da / de-re-cha / rek-to' },
]

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPanelExpanded, setIsPanelExpanded] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [notesCount, setNotesCount] = useState(0)
  const [visitedCount, setVisitedCount] = useState(0)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showTodayPlan, setShowTodayPlan] = useState(false)
  const [showPrintView, setShowPrintView] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [showPhrases, setShowPhrases] = useState(false)
  const [showCurrency, setShowCurrency] = useState(false)
  const [eurAmount, setEurAmount] = useState('50')
  const [clpRate] = useState(1050) // Approximate CLP per EUR (March 2025 estimate)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      const locations = tripData.locations
      const currentIndex = selectedLocation 
        ? locations.findIndex(l => l.id === selectedLocation.id)
        : -1
      
      switch (e.key) {
        case '?':
          e.preventDefault()
          setShowShortcuts(prev => !prev)
          break
        case 'j': // Next location
        case 'ArrowRight':
          if (currentIndex < locations.length - 1) {
            setSelectedLocation(locations[currentIndex + 1])
            setSelectedRecommendation(null)
          }
          break
        case 'k': // Previous location
        case 'ArrowLeft':
          if (currentIndex > 0) {
            setSelectedLocation(locations[currentIndex - 1])
            setSelectedRecommendation(null)
          }
          break
        case 'Escape':
          setSelectedRecommendation(null)
          setShowShortcuts(false)
          break
        case 'r': // Open full route
          e.preventDefault()
          const coords = locations.map(loc => `${loc.coordinates[0]},${loc.coordinates[1]}`)
          const origin = coords[0]
          const destination = coords[coords.length - 1]
          const waypoints = coords.slice(1, -1).join('|')
          window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`, '_blank')
          break
        case '/': // Focus search
          e.preventDefault()
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
          searchInput?.focus()
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedLocation])

  // Track favorites, notes, and visited count for header display
  useEffect(() => {
    const updateCount = () => {
      try {
        const saved = localStorage.getItem(FAVORITES_KEY)
        const favorites = saved ? JSON.parse(saved) : []
        setFavoritesCount(favorites.length)
        
        const savedNotes = localStorage.getItem(NOTES_KEY)
        const notes = savedNotes ? Object.keys(JSON.parse(savedNotes)).length : 0
        setNotesCount(notes)
        
        const savedVisited = localStorage.getItem(VISITED_KEY)
        const visited = savedVisited ? JSON.parse(savedVisited) : []
        setVisitedCount(visited.length)
      } catch {
        setFavoritesCount(0)
        setNotesCount(0)
        setVisitedCount(0)
      }
    }
    updateCount()
    // Listen for storage changes (updates from LocationPanel)
    window.addEventListener('storage', updateCount)
    // Also poll every second for same-tab updates
    const interval = setInterval(updateCount, 1000)
    return () => {
      window.removeEventListener('storage', updateCount)
      clearInterval(interval)
    }
  }, [])

  // Select Santiago by default and handle loading
  useEffect(() => {
    if (tripData.locations.length > 0 && !selectedLocation) {
      setSelectedLocation(tripData.locations[0])
    }
    // Simulate minimum loading time for smooth UX
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setCanInstall(false)
    }
    setDeferredPrompt(null)
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    setSelectedRecommendation(null)
  }

  const handleRecommendationSelect = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation)
  }

  const filteredRecommendations = selectedLocation?.recommendations.filter(rec => 
    !activeCategory || rec.category === activeCategory
  ) || []

  return (
    <div className="h-screen flex flex-col bg-chile-bg-primary text-chile-text-primary">
      {/* Header */}
      <header className="px-4 py-3 border-b border-chile-bg-secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold">🇨🇱 Chile Road Trip March 2025</h1>
              <p className="text-sm text-chile-text-secondary">
                {tripData.trip.totalDays} days • {tripData.locations.length} destinations • {tripData.locations.reduce((acc, loc) => acc + loc.recommendations.length, 0)} recommendations
              </p>
            </div>
            {/* Trip Countdown */}
            {(() => {
              const tripStart = new Date(tripData.trip.startDate)
              const now = new Date()
              const diffTime = tripStart.getTime() - now.getTime()
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
              
              if (diffDays > 0) {
                return (
                  <div className="hidden sm:flex flex-col items-center px-4 py-2 rounded-xl bg-gradient-to-r from-chile-accent-red to-chile-accent-purple bg-opacity-20 border border-chile-accent-red border-opacity-30">
                    <span className="text-2xl font-bold text-chile-accent-red">{diffDays}</span>
                    <span className="text-xs text-chile-text-secondary">days to go!</span>
                  </div>
                )
              } else if (diffDays >= -tripData.trip.totalDays) {
                return (
                  <div className="hidden sm:flex flex-col items-center px-4 py-2 rounded-xl bg-gradient-to-r from-chile-accent-teal to-green-500 bg-opacity-20 border border-chile-accent-teal border-opacity-30 animate-pulse">
                    <span className="text-lg font-bold text-chile-accent-teal">🎉 ON TRIP!</span>
                    <span className="text-xs text-chile-text-secondary">Day {Math.abs(diffDays) + 1} of {tripData.trip.totalDays}</span>
                  </div>
                )
              }
              return null
            })()}
          </div>
          <div className="flex items-center gap-2">
            {/* Today's Plan Button */}
            {(() => {
              const now = new Date()
              const tripStart = new Date(tripData.trip.startDate)
              const tripEnd = new Date(tripData.trip.endDate)
              const isOnTrip = now >= tripStart && now <= tripEnd
              const daysSinceStart = Math.floor((now.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24))
              
              // Find current location based on date
              const currentLoc = tripData.locations.find(loc => {
                const locStart = new Date(loc.startDate)
                const locEnd = new Date(loc.endDate)
                return now >= locStart && now <= locEnd
              })
              
              if (isOnTrip && currentLoc) {
                return (
                  <button
                    onClick={() => {
                      setSelectedLocation(currentLoc)
                      setShowTodayPlan(true)
                    }}
                    className="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-chile-accent-red to-chile-accent-purple text-white font-medium animate-pulse hover:animate-none transition-colors"
                    title="View today's plan"
                  >
                    📅 Today: {currentLoc.name}
                  </button>
                )
              }
              return null
            })()}
            
            {/* Travel Tools */}
            <button
              onClick={() => setShowEmergency(true)}
              className="px-2.5 py-1.5 text-sm rounded-lg bg-red-600 bg-opacity-80 hover:bg-opacity-100 transition-colors"
              title="Emergency contacts"
            >
              🆘
            </button>
            <button
              onClick={() => setShowPhrases(true)}
              className="px-2.5 py-1.5 text-sm rounded-lg bg-chile-bg-card hover:bg-chile-bg-secondary transition-colors hidden sm:block"
              title="Spanish phrases"
            >
              🇪🇸
            </button>
            <button
              onClick={() => setShowCurrency(true)}
              className="px-2.5 py-1.5 text-sm rounded-lg bg-chile-bg-card hover:bg-chile-bg-secondary transition-colors hidden sm:block"
              title="Currency converter"
            >
              💱
            </button>
            {/* Open Full Route in Google Maps */}
            <button
              onClick={() => {
                // Build Google Maps route URL with all 12 destinations
                const coords = tripData.locations.map(loc => `${loc.coordinates[0]},${loc.coordinates[1]}`)
                const origin = coords[0]
                const destination = coords[coords.length - 1]
                const waypoints = coords.slice(1, -1).join('|')
                const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`
                window.open(url, '_blank')
              }}
              className="px-3 py-1.5 text-sm rounded-lg bg-chile-accent-teal hover:bg-opacity-80 transition-colors flex items-center gap-1.5"
              title="Open complete route in Google Maps"
            >
              🗺️ <span className="hidden sm:inline">Route</span>
            </button>
            {/* Stats counters */}
            <button
              onClick={() => setShowStats(true)}
              className="flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg bg-chile-bg-card hover:bg-chile-bg-secondary transition-colors"
              title="View trip statistics"
            >
              {visitedCount > 0 && (
                <span className="flex items-center gap-1 text-green-400">
                  <span>✅</span>
                  <span>{visitedCount}</span>
                </span>
              )}
              {favoritesCount > 0 && (
                <span className="flex items-center gap-1 text-red-400">
                  <span>❤️</span>
                  <span>{favoritesCount}</span>
                </span>
              )}
              {notesCount > 0 && (
                <span className="flex items-center gap-1 text-chile-accent-teal">
                  <span>📝</span>
                  <span>{notesCount}</span>
                </span>
              )}
              {visitedCount === 0 && favoritesCount === 0 && notesCount === 0 && (
                <span className="text-chile-text-muted">📊 Stats</span>
              )}
            </button>
            {favoritesCount > 0 && (
              <>
                <button
                  onClick={() => setShowPrintView(true)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-chile-bg-card hover:bg-chile-bg-secondary transition-colors"
                  title="Print-friendly view"
                >
                  🖨️
                </button>
                <button
                  onClick={() => {
                    try {
                      const saved = localStorage.getItem(FAVORITES_KEY)
                      const favoriteIds = saved ? new Set(JSON.parse(saved)) : new Set()
                      const savedNotes = localStorage.getItem(NOTES_KEY)
                      const notes: Record<string, string> = savedNotes ? JSON.parse(savedNotes) : {}
                      const allRecs = tripData.locations.flatMap(loc => 
                        loc.recommendations
                          .filter(rec => favoriteIds.has(rec.id))
                          .map(rec => ({ ...rec, locationName: loc.name, note: notes[rec.id] }))
                      )
                      const text = `🇨🇱 Chile Trip Favorites (${allRecs.length})\n\n` + 
                        allRecs.map(r => 
                          `📍 ${r.name} (${r.locationName})\n` +
                          `   ${r.category} • ${r.address || 'No address'}\n` +
                          `   ${r.googleMapsLink || `https://maps.google.com/?q=${r.coordinates[0]},${r.coordinates[1]}`}` +
                          (r.note ? `\n   📝 ${r.note}` : '') + '\n'
                        ).join('\n')
                      navigator.clipboard.writeText(text)
                      alert('✓ Favorites copied to clipboard!')
                    } catch (e) {
                      alert('Could not export favorites')
                    }
                  }}
                  className="px-3 py-1.5 text-sm rounded-lg bg-chile-bg-card hover:bg-chile-bg-secondary transition-colors"
                  title="Copy favorites as text"
                >
                  📋
                </button>
              </>
            )}
            {canInstall && (
              <button 
                onClick={handleInstall}
                className="install-pwa-btn px-3 py-1.5 text-sm rounded-lg bg-chile-accent-red hover:bg-opacity-90 transition-colors"
              >
                📱 Install App
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Map Area */}
        <div className="flex-1 relative min-h-[40vh] md:min-h-0">
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
          
          {/* Mobile panel toggle */}
          <button 
            className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-chile-bg-card rounded-full shadow-lg z-[500] flex items-center gap-2"
            onClick={() => setIsPanelExpanded(!isPanelExpanded)}
          >
            <span>{isPanelExpanded ? '▼' : '▲'}</span>
            <span>{selectedLocation?.name || 'Select location'}</span>
          </button>
        </div>

        {/* Side Panel */}
        <div className={`
          w-full md:w-96 flex flex-col border-l border-chile-bg-secondary
          transition-all duration-300 ease-out
          ${isPanelExpanded ? 'max-h-[60vh] md:max-h-full' : 'max-h-16 md:max-h-full'}
          overflow-hidden
        `}>
          {/* Mobile handle */}
          <div 
            className="md:hidden flex items-center justify-center py-2 cursor-pointer bg-chile-bg-secondary"
            onClick={() => setIsPanelExpanded(!isPanelExpanded)}
          >
            <div className="w-12 h-1 bg-chile-bg-card rounded-full" />
          </div>

          {/* Timeline */}
          <div className="border-b border-chile-bg-secondary animate-fade-in">
            <Timeline 
              locations={tripData.locations}
              selectedLocation={selectedLocation}
              onSelect={handleLocationSelect}
            />
          </div>

          {/* Location Panel */}
          <div className="flex-1 overflow-y-auto animate-slide-up">
            {selectedLocation && (
              <LocationPanel 
                location={selectedLocation}
                selectedRecommendation={selectedRecommendation}
                onRecommendationSelect={handleRecommendationSelect}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowShortcuts(false)}
        >
          <div 
            className="bg-chile-bg-card rounded-xl p-6 shadow-2xl max-w-md w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">⌨️ Keyboard Shortcuts</h3>
              <button 
                onClick={() => setShowShortcuts(false)}
                className="text-chile-text-muted hover:text-chile-text-primary"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-chile-bg-secondary">
                <span className="text-chile-text-secondary">Next location</span>
                <div className="flex gap-2">
                  <kbd className="px-2 py-1 bg-chile-bg-secondary rounded text-xs">j</kbd>
                  <kbd className="px-2 py-1 bg-chile-bg-secondary rounded text-xs">→</kbd>
                </div>
              </div>
              <div className="flex justify-between py-2 border-b border-chile-bg-secondary">
                <span className="text-chile-text-secondary">Previous location</span>
                <div className="flex gap-2">
                  <kbd className="px-2 py-1 bg-chile-bg-secondary rounded text-xs">k</kbd>
                  <kbd className="px-2 py-1 bg-chile-bg-secondary rounded text-xs">←</kbd>
                </div>
              </div>
              <div className="flex justify-between py-2 border-b border-chile-bg-secondary">
                <span className="text-chile-text-secondary">Focus search</span>
                <kbd className="px-2 py-1 bg-chile-bg-secondary rounded text-xs">/</kbd>
              </div>
              <div className="flex justify-between py-2 border-b border-chile-bg-secondary">
                <span className="text-chile-text-secondary">Open full route</span>
                <kbd className="px-2 py-1 bg-chile-bg-secondary rounded text-xs">r</kbd>
              </div>
              <div className="flex justify-between py-2 border-b border-chile-bg-secondary">
                <span className="text-chile-text-secondary">Close / Deselect</span>
                <kbd className="px-2 py-1 bg-chile-bg-secondary rounded text-xs">Esc</kbd>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-chile-text-secondary">Show this help</span>
                <kbd className="px-2 py-1 bg-chile-bg-secondary rounded text-xs">?</kbd>
              </div>
            </div>
            <p className="mt-4 text-xs text-chile-text-muted text-center">
              Press <kbd className="px-1.5 py-0.5 bg-chile-bg-secondary rounded">?</kbd> anytime to toggle
            </p>
          </div>
        </div>
      )}

      {/* Emergency Info Modal */}
      {showEmergency && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setShowEmergency(false)}
        >
          <div 
            className="bg-chile-bg-card rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-red-600 text-white px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">🆘 Notfallnummern Chile</h3>
                <button onClick={() => setShowEmergency(false)} className="text-white/80 hover:text-white">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Emergency Numbers */}
              <div>
                <h4 className="text-sm font-semibold text-chile-text-secondary mb-3">NOTRUF</h4>
                <div className="space-y-2">
                  {EMERGENCY_INFO.emergency.map(item => (
                    <a 
                      key={item.number + item.name}
                      href={`tel:${item.number}`}
                      className="flex items-center justify-between p-3 bg-chile-bg-secondary rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-chile-text-muted">{item.desc}</div>
                      </div>
                      <div className="text-xl font-bold text-red-400">{item.number}</div>
                    </a>
                  ))}
                </div>
              </div>

              {/* German Embassy */}
              <div>
                <h4 className="text-sm font-semibold text-chile-text-secondary mb-3">🇩🇪 DEUTSCHE BOTSCHAFT</h4>
                <div className="bg-chile-bg-secondary rounded-lg p-4 space-y-2">
                  <div className="font-medium">{EMERGENCY_INFO.embassy.name}</div>
                  <div className="text-sm text-chile-text-secondary">{EMERGENCY_INFO.embassy.address}</div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <a href={`tel:${EMERGENCY_INFO.embassy.phone}`} className="px-3 py-1.5 bg-chile-accent-teal rounded text-sm">
                      📞 {EMERGENCY_INFO.embassy.phone}
                    </a>
                    <a href={`tel:${EMERGENCY_INFO.embassy.emergency}`} className="px-3 py-1.5 bg-red-500 rounded text-sm">
                      🆘 Notfall: {EMERGENCY_INFO.embassy.emergency}
                    </a>
                  </div>
                  <div className="text-xs text-chile-text-muted mt-2">
                    Öffnungszeiten: {EMERGENCY_INFO.embassy.hours} • {EMERGENCY_INFO.embassy.web}
                  </div>
                </div>
              </div>

              {/* Useful Numbers */}
              <div>
                <h4 className="text-sm font-semibold text-chile-text-secondary mb-3">WEITERE NUMMERN</h4>
                <div className="space-y-2">
                  {EMERGENCY_INFO.useful.map(item => (
                    <a 
                      key={item.number}
                      href={`tel:${item.number}`}
                      className="flex items-center justify-between p-3 bg-chile-bg-secondary rounded-lg hover:bg-chile-accent-teal/20 transition-colors"
                    >
                      <span>{item.name}</span>
                      <span className="font-mono text-chile-accent-teal">{item.number}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Save reminder */}
              <div className="text-xs text-chile-text-muted text-center pt-2 border-t border-chile-bg-secondary">
                💡 Tipp: Diese Seite im Browser als Lesezeichen speichern für Offline-Zugriff
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spanish Phrases Modal */}
      {showPhrases && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setShowPhrases(false)}
        >
          <div 
            className="bg-chile-bg-card rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-chile-accent-red to-yellow-500 text-white px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">🇪🇸 Spanisch für die Reise</h3>
                <button onClick={() => setShowPhrases(false)} className="text-white/80 hover:text-white">✕</button>
              </div>
            </div>
            <div className="divide-y divide-chile-bg-secondary">
              {SPANISH_PHRASES.map((phrase, i) => (
                <div key={i} className="px-6 py-3 hover:bg-chile-bg-secondary/50 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="text-chile-text-muted text-xs mb-1">🇩🇪 {phrase.de}</div>
                      <div className="font-medium text-lg">{phrase.es}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-chile-accent-teal font-mono">/{phrase.pron}/</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-chile-bg-secondary/30 text-center">
              <div className="text-xs text-chile-text-muted">
                💡 Chilean Spanish: "Chao" statt "Adiós", "Cachai?" = "Verstehst du?"
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Currency Converter Modal */}
      {showCurrency && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setShowCurrency(false)}
        >
          <div 
            className="bg-chile-bg-card rounded-xl shadow-2xl max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-600 to-chile-accent-teal text-white px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">💱 EUR → CLP</h3>
                <button onClick={() => setShowCurrency(false)} className="text-white/80 hover:text-white">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* EUR Input */}
              <div className="space-y-2">
                <label className="text-sm text-chile-text-secondary">Euro (EUR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-chile-text-muted">€</span>
                  <input
                    type="number"
                    value={eurAmount}
                    onChange={e => setEurAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-chile-bg-secondary rounded-lg text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-chile-accent-teal"
                    placeholder="50"
                  />
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="text-2xl">↓</div>
              </div>

              {/* CLP Output */}
              <div className="space-y-2">
                <label className="text-sm text-chile-text-secondary">Chilenische Pesos (CLP)</label>
                <div className="px-4 py-3 bg-chile-accent-teal/20 rounded-lg">
                  <div className="text-3xl font-bold text-chile-accent-teal">
                    $ {(parseFloat(eurAmount || '0') * clpRate).toLocaleString('de-DE')}
                  </div>
                </div>
              </div>

              {/* Quick amounts */}
              <div className="space-y-2">
                <label className="text-xs text-chile-text-muted">Schnellauswahl</label>
                <div className="flex flex-wrap gap-2">
                  {[10, 20, 50, 100, 200].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setEurAmount(amount.toString())}
                      className={`px-3 py-1.5 rounded text-sm ${eurAmount === amount.toString() ? 'bg-chile-accent-teal text-white' : 'bg-chile-bg-secondary hover:bg-chile-bg-card'}`}
                    >
                      €{amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference table */}
              <div className="border-t border-chile-bg-secondary pt-4">
                <div className="text-xs text-chile-text-muted mb-2">Schnellreferenz (ca. {clpRate} CLP/EUR)</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between"><span>€5</span><span className="text-chile-accent-teal">${(5 * clpRate).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>€10</span><span className="text-chile-accent-teal">${(10 * clpRate).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>€20</span><span className="text-chile-accent-teal">${(20 * clpRate).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>€50</span><span className="text-chile-accent-teal">${(50 * clpRate).toLocaleString()}</span></div>
                </div>
              </div>

              <div className="text-xs text-chile-text-muted text-center">
                💡 Kurs vom März 2025 (Schätzung). Aktuelle Kurse können abweichen.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print View Modal */}
      {showPrintView && (
        <div 
          className="fixed inset-0 z-[1000] bg-white text-black overflow-auto print:static"
          id="print-view"
        >
          <style>{`
            @media print {
              #print-view { position: static !important; }
              .no-print { display: none !important; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          `}</style>
          
          {/* Header - hide on print */}
          <div className="no-print sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h2 className="font-bold">🖨️ Print Preview</h2>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                🖨️ Print
              </button>
              <button
                onClick={() => setShowPrintView(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                ✕ Close
              </button>
            </div>
          </div>
          
          {/* Printable Content */}
          <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold text-center mb-2">🇨🇱 Chile Road Trip</h1>
            <p className="text-center text-gray-600 mb-8">
              {tripData.trip.startDate} to {tripData.trip.endDate} • {tripData.trip.totalDays} days
            </p>
            
            {(() => {
              try {
                const saved = localStorage.getItem(FAVORITES_KEY)
                const favoriteIds = saved ? new Set(JSON.parse(saved)) : new Set()
                const savedNotes = localStorage.getItem(NOTES_KEY)
                const notes: Record<string, string> = savedNotes ? JSON.parse(savedNotes) : {}
                
                return tripData.locations.map(loc => {
                  const locFavorites = loc.recommendations.filter(r => favoriteIds.has(r.id))
                  if (locFavorites.length === 0) return null
                  
                  return (
                    <div key={loc.id} className="mb-8 break-inside-avoid">
                      <h2 className="text-xl font-bold border-b-2 border-red-500 pb-2 mb-4">
                        📍 {loc.name}
                        <span className="font-normal text-sm text-gray-500 ml-2">
                          {new Date(loc.startDate).toLocaleDateString()} - {new Date(loc.endDate).toLocaleDateString()}
                        </span>
                      </h2>
                      <div className="space-y-3">
                        {locFavorites.map(rec => (
                          <div key={rec.id} className="flex gap-4 border-l-4 border-gray-200 pl-4 py-2">
                            <div className="flex-1">
                              <div className="font-semibold">{rec.name}</div>
                              <div className="text-sm text-gray-600">{rec.nameEs}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {rec.category} • {rec.address || 'No address'}
                              </div>
                              {notes[rec.id] && (
                                <div className="text-sm mt-2 bg-yellow-50 border-l-2 border-yellow-400 pl-2 py-1">
                                  📝 {notes[rec.id]}
                                </div>
                              )}
                            </div>
                            <div className="text-right text-xs text-gray-400 whitespace-nowrap">
                              ☐
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              } catch {
                return <p>Error loading favorites</p>
              }
            })()}
            
            <div className="mt-12 pt-4 border-t text-center text-sm text-gray-400">
              Generated from Chile Trip Map • {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {/* Today's Plan Modal */}
      {showTodayPlan && selectedLocation && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setShowTodayPlan(false)}
        >
          <div 
            className="bg-chile-bg-card rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-chile-accent-red to-chile-accent-purple text-white px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">📅 Today's Plan</h3>
                  <p className="text-sm opacity-90">{new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <button onClick={() => setShowTodayPlan(false)} className="text-white/80 hover:text-white">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Current Location */}
              <div className="text-center">
                <div className="text-3xl mb-2">📍</div>
                <h4 className="text-xl font-bold">{selectedLocation.name}</h4>
                <p className="text-sm text-chile-text-secondary">{selectedLocation.nameEs}</p>
                <p className="text-xs text-chile-text-muted mt-1">
                  {new Date(selectedLocation.startDate).toLocaleDateString()} - {new Date(selectedLocation.endDate).toLocaleDateString()}
                </p>
              </div>

              {/* Favorites for this location */}
              {(() => {
                try {
                  const saved = localStorage.getItem(FAVORITES_KEY)
                  const favoriteIds = saved ? new Set(JSON.parse(saved)) : new Set()
                  const savedNotes = localStorage.getItem(NOTES_KEY)
                  const notes: Record<string, string> = savedNotes ? JSON.parse(savedNotes) : {}
                  const savedVisited = localStorage.getItem(VISITED_KEY)
                  const visitedIds = savedVisited ? new Set(JSON.parse(savedVisited)) : new Set()
                  
                  const favorites = selectedLocation.recommendations.filter(r => favoriteIds.has(r.id))
                  
                  if (favorites.length === 0) {
                    return (
                      <div className="text-center py-6 text-chile-text-muted">
                        <div className="text-3xl mb-2">💡</div>
                        <p>No favorites saved for {selectedLocation.name} yet.</p>
                        <p className="text-xs mt-2">Add favorites by clicking ❤️ on recommendations!</p>
                      </div>
                    )
                  }
                  
                  return (
                    <div>
                      <h4 className="text-sm font-semibold text-chile-text-secondary mb-3">
                        ❤️ YOUR FAVORITES ({favorites.length})
                      </h4>
                      <div className="space-y-3">
                        {favorites.map(rec => (
                          <div 
                            key={rec.id} 
                            className={`p-3 rounded-lg ${visitedIds.has(rec.id) ? 'bg-green-900/20 border border-green-600/30' : 'bg-chile-bg-secondary'}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{rec.name}</span>
                                  {visitedIds.has(rec.id) && <span className="text-xs text-green-400">✓</span>}
                                </div>
                                <p className="text-xs text-chile-text-muted mt-1">{rec.category} • {rec.address || 'No address'}</p>
                                {notes[rec.id] && (
                                  <p className="text-xs text-chile-accent-teal mt-2 bg-chile-accent-teal/10 px-2 py-1 rounded">
                                    📝 {notes[rec.id]}
                                  </p>
                                )}
                              </div>
                              <a
                                href={rec.googleMapsLink || `https://maps.google.com/?q=${rec.coordinates[0]},${rec.coordinates[1]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 text-xs rounded bg-chile-accent-red hover:bg-opacity-80"
                              >
                                📍
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                } catch {
                  return null
                }
              })()}

              {/* Quick Actions */}
              <div className="pt-4 border-t border-chile-bg-secondary space-y-2">
                <button
                  onClick={() => {
                    setShowTodayPlan(false)
                    // Already selected the location
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-chile-accent-teal hover:bg-opacity-90 transition-colors font-medium"
                >
                  🗺️ View on Map
                </button>
                <button
                  onClick={() => {
                    const coords = `${selectedLocation.coordinates[0]},${selectedLocation.coordinates[1]}`
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords}&travelmode=driving`, '_blank')
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-chile-bg-secondary hover:bg-chile-bg-card transition-colors"
                >
                  🧭 Navigate to {selectedLocation.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trip Statistics Modal */}
      {showStats && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setShowStats(false)}
        >
          <div 
            className="bg-chile-bg-card rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-chile-accent-red via-white to-chile-accent-teal text-chile-bg-primary px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">📊 Trip Statistics</h3>
                <button onClick={() => setShowStats(false)} className="text-chile-bg-primary/80 hover:text-chile-bg-primary">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-chile-bg-secondary rounded-xl">
                  <div className="text-3xl font-bold text-chile-accent-red">{tripData.trip.totalDays}</div>
                  <div className="text-xs text-chile-text-muted mt-1">Days</div>
                </div>
                <div className="text-center p-4 bg-chile-bg-secondary rounded-xl">
                  <div className="text-3xl font-bold text-chile-accent-teal">{tripData.locations.length}</div>
                  <div className="text-xs text-chile-text-muted mt-1">Destinations</div>
                </div>
                <div className="text-center p-4 bg-chile-bg-secondary rounded-xl">
                  <div className="text-3xl font-bold text-chile-accent-purple">{tripData.locations.reduce((a, l) => a + l.recommendations.length, 0)}</div>
                  <div className="text-xs text-chile-text-muted mt-1">Places</div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <h4 className="text-sm font-semibold text-chile-text-secondary mb-3">TRIP PROGRESS</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span>✅</span> Visited
                    </span>
                    <span className="font-mono text-green-400">{visitedCount} / {tripData.locations.reduce((a, l) => a + l.recommendations.length, 0)}</span>
                  </div>
                  <div className="h-2 bg-chile-bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${(visitedCount / tripData.locations.reduce((a, l) => a + l.recommendations.length, 0)) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>❤️</span> Favorites
                    </span>
                    <span className="font-mono text-red-400">{favoritesCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>📝</span> Notes
                    </span>
                    <span className="font-mono text-chile-accent-teal">{notesCount}</span>
                  </div>
                </div>
              </div>

              {/* Per-Location Breakdown */}
              <div>
                <h4 className="text-sm font-semibold text-chile-text-secondary mb-3">BY DESTINATION</h4>
                <div className="space-y-2">
                  {tripData.locations.map(loc => {
                    const totalRecs = loc.recommendations.length
                    const visitedIds = (() => {
                      try {
                        const saved = localStorage.getItem(VISITED_KEY)
                        return saved ? new Set(JSON.parse(saved)) : new Set()
                      } catch { return new Set() }
                    })()
                    const locVisited = loc.recommendations.filter(r => visitedIds.has(r.id)).length
                    const pct = totalRecs > 0 ? (locVisited / totalRecs) * 100 : 0
                    return (
                      <div key={loc.id} className="p-3 bg-chile-bg-secondary rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{loc.name}</span>
                          <span className="text-xs text-chile-text-muted">{locVisited}/{totalRecs}</span>
                        </div>
                        <div className="h-1.5 bg-chile-bg-card rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-chile-accent-red to-chile-accent-teal rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Category Breakdown */}
              <div>
                <h4 className="text-sm font-semibold text-chile-text-secondary mb-3">BY CATEGORY</h4>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const categories: Record<string, number> = {}
                    tripData.locations.forEach(loc => {
                      loc.recommendations.forEach(rec => {
                        categories[rec.category] = (categories[rec.category] || 0) + 1
                      })
                    })
                    return Object.entries(categories)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, count]) => (
                        <span key={cat} className="px-3 py-1.5 text-xs rounded-full bg-chile-bg-secondary">
                          {cat}: {count}
                        </span>
                      ))
                  })()}
                </div>
              </div>

              {/* Backup & Restore */}
              <div className="pt-4 border-t border-chile-bg-secondary">
                <h4 className="text-sm font-semibold text-chile-text-secondary mb-3">BACKUP & RESTORE</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => {
                      try {
                        const backup = {
                          version: 1,
                          exportedAt: new Date().toISOString(),
                          favorites: JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'),
                          notes: JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'),
                          visited: JSON.parse(localStorage.getItem(VISITED_KEY) || '[]'),
                        }
                        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `chile-trip-backup-${new Date().toISOString().split('T')[0]}.json`
                        a.click()
                        URL.revokeObjectURL(url)
                        alert('✓ Backup downloaded!')
                      } catch (e) {
                        alert('Export failed: ' + (e as Error).message)
                      }
                    }}
                    className="px-4 py-2 text-sm rounded-lg bg-chile-accent-teal hover:bg-opacity-80 transition-colors flex items-center gap-2"
                  >
                    💾 Export Backup
                  </button>
                  <label className="px-4 py-2 text-sm rounded-lg bg-chile-bg-secondary hover:bg-chile-bg-card transition-colors cursor-pointer flex items-center gap-2">
                    📥 Import Backup
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          try {
                            const backup = JSON.parse(event.target?.result as string)
                            if (!backup.version || !backup.favorites) {
                              throw new Error('Invalid backup file format')
                            }
                            if (!confirm(`Import backup from ${backup.exportedAt?.split('T')[0] || 'unknown date'}?\n\nThis will replace:\n• ${backup.favorites?.length || 0} favorites\n• ${Object.keys(backup.notes || {}).length} notes\n• ${backup.visited?.length || 0} visited markers\n\nYour current data will be overwritten.`)) {
                              return
                            }
                            localStorage.setItem(FAVORITES_KEY, JSON.stringify(backup.favorites || []))
                            localStorage.setItem(NOTES_KEY, JSON.stringify(backup.notes || {}))
                            localStorage.setItem(VISITED_KEY, JSON.stringify(backup.visited || []))
                            setFavoritesCount(backup.favorites?.length || 0)
                            setNotesCount(Object.keys(backup.notes || {}).length)
                            setVisitedCount(backup.visited?.length || 0)
                            alert('✓ Backup restored successfully!')
                          } catch (err) {
                            alert('Import failed: ' + (err as Error).message)
                          }
                        }
                        reader.readAsText(file)
                        e.target.value = '' // Reset input
                      }}
                    />
                  </label>
                </div>
                <p className="text-xs text-chile-text-muted mb-4">
                  💡 Export your favorites, notes, and visited places. Perfect for syncing between devices or creating a backup before the trip!
                </p>
              </div>

              {/* Reset Actions */}
              <div className="pt-4 border-t border-chile-bg-secondary">
                <h4 className="text-sm font-semibold text-chile-text-secondary mb-3">RESET DATA</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (confirm('Reset all visited markers?')) {
                        localStorage.removeItem(VISITED_KEY)
                        setVisitedCount(0)
                      }
                    }}
                    className="px-3 py-1.5 text-xs rounded bg-chile-bg-secondary hover:bg-red-500/20 text-chile-text-muted hover:text-red-400 transition-colors"
                  >
                    🗑️ Reset Visited
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Reset all favorites?')) {
                        localStorage.removeItem(FAVORITES_KEY)
                        setFavoritesCount(0)
                      }
                    }}
                    className="px-3 py-1.5 text-xs rounded bg-chile-bg-secondary hover:bg-red-500/20 text-chile-text-muted hover:text-red-400 transition-colors"
                  >
                    🗑️ Reset Favorites
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Reset all notes?')) {
                        localStorage.removeItem(NOTES_KEY)
                        setNotesCount(0)
                      }
                    }}
                    className="px-3 py-1.5 text-xs rounded bg-chile-bg-secondary hover:bg-red-500/20 text-chile-text-muted hover:text-red-400 transition-colors"
                  >
                    🗑️ Reset Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="px-4 py-2 text-xs text-chile-text-muted border-t border-chile-bg-secondary">
        <div className="flex justify-between">
          <span>Interactive Map PWA • Offline-capable • Made with React + Leaflet</span>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowShortcuts(true)}
              className="hover:text-chile-text-secondary transition-colors hidden sm:block"
            >
              ⌨️ Shortcuts
            </button>
            <span>Data: Brave Search API • Updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
