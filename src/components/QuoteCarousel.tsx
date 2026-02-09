import { useState, useMemo } from 'react'
import quotesData from '../data/quotes.json'
import tripData from '../data/trip-data.json'

interface QuoteCarouselProps {
  onClose: () => void
  currentLocationId?: string | null
}

export default function QuoteCarousel({ onClose, currentLocationId }: QuoteCarouselProps) {
  const allQuotes = quotesData.quotes
  const [index, setIndex] = useState(() => Math.floor(Math.random() * allQuotes.length))
  const [showLocation, setShowLocation] = useState(false)

  const quote = allQuotes[index]

  const locationName = useMemo(() => {
    if (!quote?.location) return null
    return tripData.locations.find(l => l.id === quote.location)?.name || quote.location
  }, [quote])

  // Filter: location-specific quotes
  const locationQuotes = useMemo(() => {
    if (!currentLocationId) return []
    return allQuotes.filter(q => q.location === currentLocationId)
  }, [currentLocationId, allQuotes])

  const prev = () => setIndex(i => i > 0 ? i - 1 : allQuotes.length - 1)
  const next = () => setIndex(i => i < allQuotes.length - 1 ? i + 1 : 0)
  const random = () => setIndex(Math.floor(Math.random() * allQuotes.length))

  const randomLocal = () => {
    if (locationQuotes.length === 0) return
    const localIdx = Math.floor(Math.random() * locationQuotes.length)
    const globalIdx = allQuotes.indexOf(locationQuotes[localIdx])
    if (globalIdx >= 0) setIndex(globalIdx)
  }

  return (
    <div className="absolute inset-0 z-[700] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Quote Card */}
      <div className="relative bg-chile-bg-card/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 max-w-md w-full overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <div>
              <h2 className="font-bold text-lg">Reisezitate</h2>
              <p className="text-xs text-chile-text-muted">
                {allQuotes.length} Zitate über Chile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Quote Content */}
        <div className="p-6 min-h-[200px] flex flex-col justify-center">
          {/* Opening Quote Mark */}
          <div className="text-4xl text-chile-accent-red/40 leading-none mb-2">„</div>

          {/* Quote Text */}
          <blockquote className="text-lg leading-relaxed italic pl-2">
            {quote.text}
          </blockquote>

          {/* Spanish version if available */}
          {quote.textEs && (
            <button
              onClick={() => setShowLocation(!showLocation)}
              className="mt-3 pl-2"
            >
              {showLocation ? (
                <p className="text-sm text-chile-accent-teal/80 italic">
                  „{quote.textEs}"
                </p>
              ) : (
                <span className="text-xs text-chile-text-muted hover:text-chile-accent-teal transition-colors">
                  🇪🇸 Auf Spanisch anzeigen
                </span>
              )}
            </button>
          )}

          {/* Closing Quote Mark */}
          <div className="text-4xl text-chile-accent-red/40 leading-none text-right mt-2">"</div>

          {/* Author */}
          <div className="mt-4 text-right">
            <p className="font-medium text-sm">— {quote.author}</p>
            {quote.context && (
              <p className="text-xs text-chile-text-muted mt-0.5">{quote.context}</p>
            )}
            {locationName && (
              <p className="text-xs text-chile-accent-teal mt-1">📍 {locationName}</p>
            )}
          </div>

          {/* Counter */}
          <div className="text-center text-xs text-chile-text-muted mt-4">
            {index + 1} / {allQuotes.length}
          </div>
        </div>

        {/* Navigation */}
        <div className="px-4 py-3 border-t border-white/10 flex gap-2">
          <button
            onClick={prev}
            className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-1 text-sm"
          >
            ← Zurück
          </button>
          {locationQuotes.length > 0 && (
            <button
              onClick={randomLocal}
              className="px-3 py-2 rounded-lg bg-chile-accent-teal/20 hover:bg-chile-accent-teal/30 transition-colors text-chile-accent-teal text-sm"
              title={`Zitat über ${tripData.locations.find(l => l.id === currentLocationId)?.name || 'diesen Ort'}`}
            >
              📍
            </button>
          )}
          <button
            onClick={random}
            className="px-4 py-2 rounded-lg bg-chile-accent-red hover:bg-chile-accent-red/80 transition-colors text-sm"
          >
            🎲
          </button>
          <button
            onClick={next}
            className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-1 text-sm"
          >
            Weiter →
          </button>
        </div>
      </div>
    </div>
  )
}
