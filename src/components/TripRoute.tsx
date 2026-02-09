import { useState } from 'react'
import tripData from '../data/trip-data.json'

interface TripRouteProps {
  onClose: () => void
  favorites: Set<string>
  visited: Set<string>
}

type Location = (typeof tripData.locations)[0]

// Haversine formula for distance between two coordinates
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function estimateDrivingTime(km: number): { hours: number; minutes: number; label: string } {
  // Chilean roads: ~55km/h average (winding, mountain, Ruta 5 mix)
  const totalMin = Math.round((km / 55) * 60)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  const label = h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m}min`
  return { hours: h, minutes: m, label }
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate()}.${d.getMonth() + 1}.`
}

// Region descriptions for the trip
const regionDescriptions: Record<string, string> = {
  santiago: 'Hauptstadt • Kultur & Gastronomie',
  quillimari: 'Küste • Fischerdorf & Strände',
  algarrobo: 'Küste • Pinguine & Strände',
  'wine-resort': 'Zentraltal • Wein & Natur',
  'san-carlos': 'Ñuble • Ländliches Chile',
  chillan: 'Ñuble • Markt & Vulkan',
  conguillio: 'Araukarien • Nationalpark',
  pucon: 'Seengebiet • Abenteuer-Hauptstadt',
  valdivia: 'Seengebiet • Flussstadt & Bier',
  osorno: 'Seengebiet • Vulkane & Natur',
  'frutillar-puerto-varas': 'Seengebiet • Deutsche Tradition',
  chiloe: 'Insel • Mythologie & Holzkirchen',
}

export default function TripRoute({ onClose, favorites, visited }: TripRouteProps) {
  const [expandedLoc, setExpandedLoc] = useState<string | null>(null)

  const locations = tripData.locations

  // Calculate segments between locations
  const segments = locations.slice(0, -1).map((loc, i) => {
    const next = locations[i + 1]
    const km = Math.round(getDistance(
      loc.coordinates[0], loc.coordinates[1],
      next.coordinates[0], next.coordinates[1]
    ))
    return { km, ...estimateDrivingTime(km) }
  })

  const totalKm = segments.reduce((sum, s) => sum + s.km, 0)
  const totalDrivingMin = segments.reduce((sum, s) => sum + s.hours * 60 + s.minutes, 0)
  const totalDrivingH = Math.floor(totalDrivingMin / 60)
  const totalDrivingM = totalDrivingMin % 60

  // Trip progress
  const now = new Date()
  const tripStart = new Date(tripData.trip.startDate)
  const tripEnd = new Date(tripData.trip.endDate)
  const daysUntil = Math.ceil((tripStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isOnTrip = now >= tripStart && now <= tripEnd
  const isTripDone = now > tripEnd

  // Stats
  const totalRecs = locations.reduce((sum, l) => sum + l.recommendations.length, 0)
  const totalFavs = locations.reduce((sum, l) => sum + l.recommendations.filter(r => favorites.has(r.id)).length, 0)
  const totalVisited = locations.reduce((sum, l) => sum + l.recommendations.filter(r => visited.has(r.id)).length, 0)

  const getProgressColor = (loc: Location) => {
    const v = loc.recommendations.filter(r => visited.has(r.id)).length
    const total = loc.recommendations.length
    if (total === 0) return 'bg-white/10'
    const pct = v / total
    if (pct === 0) return 'bg-white/10'
    if (pct < 0.25) return 'bg-chile-accent-red/30'
    if (pct < 0.5) return 'bg-amber-500/30'
    if (pct < 0.75) return 'bg-chile-accent-teal/30'
    return 'bg-green-500/30'
  }

  return (
    <div className="absolute inset-0 z-[700] flex flex-col bg-chile-bg-primary">
      {/* Header */}
      <div
        className="flex-shrink-0 px-4 py-3 border-b border-white/10 bg-chile-bg-card/95 backdrop-blur-sm flex items-center gap-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
      >
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-lg">🗺️ Reiseroute</h1>
          <p className="text-xs text-chile-text-muted">
            {tripData.trip.totalDays} Tage • {locations.length} Orte • ~{totalKm.toLocaleString()} km
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Trip Summary Card */}
        <div className="px-4 pt-4 pb-2">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-chile-accent-red/20 to-chile-accent-teal/10 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-bold text-base">🇨🇱 Chile Road Trip</h2>
                <p className="text-xs text-chile-text-muted mt-0.5">
                  {formatDateShort(tripData.trip.startDate)} – {formatDateShort(tripData.trip.endDate)} {new Date(tripData.trip.startDate).getFullYear()}
                </p>
              </div>
              {daysUntil > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-chile-accent-red">{daysUntil}</div>
                  <div className="text-[10px] text-chile-text-muted">Tage noch</div>
                </div>
              )}
              {isOnTrip && (
                <div className="px-3 py-1.5 bg-green-500/20 rounded-full">
                  <span className="text-green-400 text-sm font-medium">🟢 Unterwegs!</span>
                </div>
              )}
              {isTripDone && (
                <div className="px-3 py-1.5 bg-chile-accent-teal/20 rounded-full">
                  <span className="text-chile-accent-teal text-sm font-medium">✅ Abgeschlossen</span>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 rounded-lg bg-white/5">
                <div className="text-lg font-bold text-chile-accent-red">{totalKm.toLocaleString()}</div>
                <div className="text-[10px] text-chile-text-muted">km Strecke</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <div className="text-lg font-bold text-chile-accent-teal">{totalDrivingH}h{totalDrivingM > 0 ? ` ${totalDrivingM}m` : ''}</div>
                <div className="text-[10px] text-chile-text-muted">Fahrzeit</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <div className="text-lg font-bold text-amber-400">{totalRecs}</div>
                <div className="text-[10px] text-chile-text-muted">Empfehlungen</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <div className="text-lg font-bold text-pink-400">{totalFavs}</div>
                <div className="text-[10px] text-chile-text-muted">Favoriten</div>
              </div>
            </div>

            {/* Progress Bar */}
            {totalVisited > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-chile-text-muted">Fortschritt</span>
                  <span className="text-[10px] text-green-400">{totalVisited}/{totalRecs} besucht ({Math.round(totalVisited / totalRecs * 100)}%)</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-chile-accent-teal rounded-full transition-all"
                    style={{ width: `${(totalVisited / totalRecs) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Route Timeline */}
        <div className="px-4 py-2">
          {locations.map((loc, index) => {
            const isExpanded = expandedLoc === loc.id
            const locFavs = loc.recommendations.filter(r => favorites.has(r.id)).length
            const locVisited = loc.recommendations.filter(r => visited.has(r.id)).length
            const segment = index < segments.length ? segments[index] : null

            return (
              <div key={loc.id}>
                {/* Location Card */}
                <div className="flex gap-3">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        locVisited === loc.recommendations.length && loc.recommendations.length > 0
                          ? 'bg-green-500 border-green-400 text-white'
                          : locVisited > 0
                            ? 'bg-chile-accent-teal/30 border-chile-accent-teal text-chile-accent-teal'
                            : 'bg-chile-accent-red/20 border-chile-accent-red/50 text-chile-accent-red'
                      }`}
                    >
                      {locVisited === loc.recommendations.length && loc.recommendations.length > 0
                        ? '✓'
                        : index + 1}
                    </div>
                    {index < locations.length - 1 && (
                      <div className="w-0.5 flex-1 bg-white/10 min-h-[24px]" />
                    )}
                  </div>

                  {/* Location Content */}
                  <div className="flex-1 min-w-0 pb-2">
                    <button
                      onClick={() => setExpandedLoc(isExpanded ? null : loc.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${getProgressColor(loc)} hover:bg-white/10`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm">{loc.name}</h3>
                            {loc.type === 'transit' && (
                              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded-full">Durchreise</span>
                            )}
                          </div>
                          <p className="text-[11px] text-chile-text-muted mt-0.5">
                            {regionDescriptions[loc.id] || loc.description?.slice(0, 50)}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="text-[11px] text-chile-text-secondary">
                            {formatDateShort(loc.startDate)}–{formatDateShort(loc.endDate)}
                          </div>
                          <div className="text-[10px] text-chile-text-muted">
                            {loc.durationDays} {loc.durationDays === 1 ? 'Tag' : 'Tage'}
                          </div>
                        </div>
                      </div>

                      {/* Mini stats */}
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-chile-text-muted">
                        <span>📍 {loc.recommendations.length} Orte</span>
                        {locFavs > 0 && <span>❤️ {locFavs}</span>}
                        {locVisited > 0 && <span>✅ {locVisited}/{loc.recommendations.length}</span>}
                        <span className="ml-auto">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </button>

                    {/* Expanded: Top Recommendations */}
                    {isExpanded && (
                      <div className="mt-2 ml-1 space-y-1 animate-slide-up">
                        {loc.recommendations
                          .sort((a, b) => {
                            // Favorites first, then visited, then rest
                            const af = favorites.has(a.id) ? 0 : 1
                            const bf = favorites.has(b.id) ? 0 : 1
                            if (af !== bf) return af - bf
                            return 0
                          })
                          .slice(0, 8)
                          .map(rec => (
                            <div
                              key={rec.id}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${
                                visited.has(rec.id) ? 'bg-green-500/10 text-green-300' : 'bg-white/5'
                              }`}
                            >
                              <span className="flex-shrink-0">
                                {{
                                  restaurant: '🍽️', café: '☕', cafe: '☕', bar: '🍺', museum: '🏛️',
                                  nature: '🌲', beach: '🏖️', winery: '🍷', historical: '🏰',
                                  unique: '⭐', hiking: '🥾', viewpoint: '👁️', hotspring: '♨️',
                                  volcano: '🌋', waterfall: '💧', art: '🎨', church: '⛪',
                                  event: '🎪', shopping: '🛍️', lake: '💙', seafood: '🦐',
                                  food: '🥘', dessert: '🍰', nightlife: '🌙', monument: '🗿',
                                }[rec.category.toLowerCase()] || '📍'}
                              </span>
                              <span className="truncate flex-1">{rec.name}</span>
                              {favorites.has(rec.id) && <span className="flex-shrink-0">❤️</span>}
                              {visited.has(rec.id) && <span className="flex-shrink-0 text-green-400">✓</span>}
                            </div>
                          ))}
                        {loc.recommendations.length > 8 && (
                          <div className="text-[10px] text-chile-text-muted text-center py-1">
                            +{loc.recommendations.length - 8} weitere Empfehlungen
                          </div>
                        )}

                        {/* Navigate Button */}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${loc.coordinates[0]},${loc.coordinates[1]}&travelmode=driving`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 mt-1 py-2 rounded-lg bg-chile-accent-teal/20 text-chile-accent-teal text-xs font-medium hover:bg-chile-accent-teal/30 transition-colors"
                        >
                          🧭 In Google Maps navigieren
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Driving Segment */}
                {segment && (
                  <div className="flex gap-3 py-1">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-0.5 flex-1 bg-white/10" />
                    </div>
                    <div className="flex-1 flex items-center gap-2 py-1">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] text-chile-text-muted">
                        <span>🚗</span>
                        <span className="font-medium text-chile-text-secondary">{segment.label}</span>
                        <span>•</span>
                        <span>{segment.km} km</span>
                      </div>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${loc.coordinates[0]},${loc.coordinates[1]}&destination=${locations[index + 1].coordinates[0]},${locations[index + 1].coordinates[1]}&travelmode=driving`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-chile-accent-teal hover:underline"
                      >
                        Route →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-4 pb-6 pt-2">
          <div className="text-[10px] text-chile-text-muted text-center leading-relaxed">
            💡 Fahrzeiten sind Schätzungen (~55 km/h Durchschnitt auf chilenischen Straßen).<br />
            Tatsächliche Zeiten können je nach Route und Verkehr abweichen.
          </div>

          {/* Open Full Route in Google Maps */}
          <button
            onClick={() => {
              const coords = locations.map(l => `${l.coordinates[0]},${l.coordinates[1]}`)
              const origin = coords[0]
              const destination = coords[coords.length - 1]
              const waypoints = coords.slice(1, -1).join('|')
              window.open(
                `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`,
                '_blank'
              )
            }}
            className="mt-3 w-full py-2.5 rounded-xl bg-chile-accent-red/20 text-chile-accent-red text-sm font-medium hover:bg-chile-accent-red/30 transition-colors flex items-center justify-center gap-2"
          >
            🗺️ Komplette Route in Google Maps öffnen
          </button>
        </div>
      </div>
    </div>
  )
}
