import tripData from '../data/trip-data.json'
import factsData from '../data/facts.json'

interface TripStatsProps {
  onClose: () => void
  favorites: Set<string>
  visited: Set<string>
  notes: Record<string, string>
}

export default function TripStats({ onClose, favorites, visited, notes }: TripStatsProps) {
  const totalRecs = tripData.locations.reduce((acc, loc) => acc + loc.recommendations.length, 0)
  const visitedCount = visited.size
  const favCount = favorites.size
  const notesCount = Object.keys(notes).length
  const visitProgress = totalRecs > 0 ? Math.round((visitedCount / totalRecs) * 100) : 0

  // Per-location stats
  const locationStats = tripData.locations.map(loc => {
    const locVisited = loc.recommendations.filter(r => visited.has(r.id)).length
    const locFavs = loc.recommendations.filter(r => favorites.has(r.id)).length
    const total = loc.recommendations.length
    const progress = total > 0 ? Math.round((locVisited / total) * 100) : 0
    return {
      id: loc.id,
      name: loc.name,
      total,
      visited: locVisited,
      favorites: locFavs,
      progress,
      durationDays: loc.durationDays,
    }
  })

  // Category breakdown from visited
  const categoryStats: Record<string, { visited: number; total: number }> = {}
  for (const loc of tripData.locations) {
    for (const rec of loc.recommendations) {
      const cat = rec.category
      if (!categoryStats[cat]) categoryStats[cat] = { visited: 0, total: 0 }
      categoryStats[cat].total++
      if (visited.has(rec.id)) categoryStats[cat].visited++
    }
  }

  // Trip dates
  const tripStart = new Date(tripData.trip.startDate)
  const tripEnd = new Date(tripData.trip.endDate)
  const now = new Date()
  const daysUntil = Math.ceil((tripStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isTripActive = now >= tripStart && now <= tripEnd
  const tripDone = now > tripEnd

  return (
    <div className="absolute inset-0 z-[700] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-chile-bg-card/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 max-w-md w-full max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <div>
              <h2 className="font-bold text-lg">Trip Statistik</h2>
              <p className="text-xs text-chile-text-muted">
                {tripData.trip.totalDays} Tage • {tripData.locations.length} Orte • {totalRecs} Spots
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

        <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(85vh - 60px)' }}>
          
          {/* Trip Countdown / Status */}
          <div className={`p-4 rounded-xl text-center ${
            isTripActive ? 'bg-green-500/10 border border-green-500/20' :
            tripDone ? 'bg-chile-accent-teal/10 border border-chile-accent-teal/20' :
            'bg-chile-accent-red/10 border border-chile-accent-red/20'
          }`}>
            {isTripActive ? (
              <>
                <div className="text-3xl mb-1">🎉</div>
                <div className="font-bold text-lg text-green-400">Trip läuft!</div>
                <div className="text-xs text-chile-text-muted">Genieß jeden Moment</div>
              </>
            ) : tripDone ? (
              <>
                <div className="text-3xl mb-1">✈️</div>
                <div className="font-bold text-lg text-chile-accent-teal">Trip abgeschlossen</div>
                <div className="text-xs text-chile-text-muted">Was für ein Abenteuer!</div>
              </>
            ) : (
              <>
                <div className="text-4xl font-bold text-chile-accent-red">{daysUntil}</div>
                <div className="text-sm text-chile-text-secondary">Tage bis zum Abflug</div>
                <div className="text-xs text-chile-text-muted mt-1">
                  {tripStart.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })} – {tripEnd.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </>
            )}
          </div>

          {/* Overall Progress Ring */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-4">
              {/* Progress Circle */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#2a9d8f"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${visitProgress}, 100`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-chile-accent-teal">{visitProgress}%</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="text-center p-2 rounded-lg bg-green-500/10">
                  <div className="text-xl font-bold text-green-400">{visitedCount}</div>
                  <div className="text-[10px] text-chile-text-muted">Besucht</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-red-500/10">
                  <div className="text-xl font-bold text-red-400">{favCount}</div>
                  <div className="text-[10px] text-chile-text-muted">Favoriten</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-blue-500/10">
                  <div className="text-xl font-bold text-blue-400">{notesCount}</div>
                  <div className="text-[10px] text-chile-text-muted">Notizen</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-purple-500/10">
                  <div className="text-xl font-bold text-purple-400">{factsData.totalFacts}</div>
                  <div className="text-[10px] text-chile-text-muted">Fakten</div>
                </div>
              </div>
            </div>
          </div>

          {/* Per Location Progress */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <span>📍</span> Fortschritt pro Ort
            </h3>
            <div className="space-y-2">
              {locationStats.map((loc) => (
                <div key={loc.id} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium truncate">{loc.name}</span>
                      <span className="text-[10px] text-chile-text-muted ml-1 flex-shrink-0">
                        {loc.visited}/{loc.total}
                        {loc.favorites > 0 && <span className="text-red-400 ml-1">❤️{loc.favorites}</span>}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-chile-accent-teal rounded-full transition-all duration-500"
                        style={{ width: `${loc.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <span>🏷️</span> Kategorien
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(categoryStats)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([cat, stats]) => (
                  <div 
                    key={cat}
                    className="px-2 py-1 rounded-full bg-chile-bg-secondary text-xs flex items-center gap-1"
                  >
                    <span>{cat}</span>
                    <span className="text-chile-text-muted">
                      {stats.visited > 0 ? (
                        <span className="text-green-400">{stats.visited}</span>
                      ) : null}
                      /{stats.total}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
