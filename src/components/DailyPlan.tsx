import { useState, useMemo } from 'react'
import tripData from '../data/trip-data.json'

interface DailyPlanProps {
  onClose: () => void
  favorites: Set<string>
}

type Rec = (typeof tripData.locations)[0]['recommendations'][0]

// Time slots for organizing activities
const TIME_SLOTS = [
  { id: 'morning', label: 'Vormittag', icon: '🌅', time: '9:00–12:00', categories: ['hiking', 'nature', 'viewpoint', 'volcano', 'lake', 'waterfall', 'garden', 'beach'] },
  { id: 'midday', label: 'Mittag', icon: '☀️', time: '12:00–14:00', categories: ['restaurant', 'seafood', 'food', 'market', 'café', 'cafe'] },
  { id: 'afternoon', label: 'Nachmittag', icon: '🌤️', time: '14:00–18:00', categories: ['museum', 'historical', 'church', 'monument', 'art', 'theater', 'shopping', 'winery', 'activity', 'hotspring', 'unique'] },
  { id: 'evening', label: 'Abend', icon: '🌙', time: '18:00+', categories: ['restaurant', 'bar', 'nightlife', 'event', 'dessert'] },
]

// Category icons
const CATEGORY_ICONS: Record<string, string> = {
  restaurant: '🍽️', café: '☕', cafe: '☕', bar: '🍺', viewpoint: '👁️', museum: '🏛️',
  market: '🛒', park: '🌳', beach: '🏖️', winery: '🍷', nature: '🌲', historical: '🏰',
  activity: '🎯', shopping: '🛍️', unique: '⭐', art: '🎨', hotspring: '♨️', hiking: '🥾',
  event: '🎪', waterfall: '💧', volcano: '🌋', lake: '💙', garden: '🌺', church: '⛪',
  monument: '🗿', theater: '🎭', nightlife: '🌙', transport: '🚂', food: '🥘',
  dessert: '🍰', seafood: '🦐',
}

function assignRecsToSlots(recs: Rec[]): Record<string, Rec[]> {
  const assigned: Record<string, Rec[]> = { morning: [], midday: [], afternoon: [], evening: [] }
  const used = new Set<string>()

  // First pass: assign by primary category match
  for (const slot of TIME_SLOTS) {
    for (const rec of recs) {
      if (used.has(rec.id)) continue
      if (slot.categories.includes(rec.category.toLowerCase())) {
        assigned[slot.id].push(rec)
        used.add(rec.id)
      }
    }
  }

  // Second pass: distribute unassigned evenly
  const unassigned = recs.filter(r => !used.has(r.id))
  const slotKeys = ['morning', 'afternoon', 'midday', 'evening']
  let slotIdx = 0
  for (const rec of unassigned) {
    assigned[slotKeys[slotIdx % slotKeys.length]].push(rec)
    slotIdx++
  }

  return assigned
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
  return `${weekdays[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]}`
}

export default function DailyPlan({ onClose, favorites }: DailyPlanProps) {
  const [selectedLocIdx, setSelectedLocIdx] = useState(0)

  const locations = tripData.locations

  // Create day plans for selected location
  const dayPlans = useMemo(() => {
    const loc = locations[selectedLocIdx]
    if (!loc) return []

    const days = loc.durationDays
    const allRecs = [...loc.recommendations]

    // Prioritize favorites
    allRecs.sort((a, b) => {
      const aFav = favorites.has(a.id) ? 0 : 1
      const bFav = favorites.has(b.id) ? 0 : 1
      return aFav - bFav
    })

    // Distribute recs across days
    const recsPerDay = Math.ceil(allRecs.length / days)
    const plans: Array<{ day: number; date: string; recs: Rec[]; slots: Record<string, Rec[]> }> = []

    for (let d = 0; d < days; d++) {
      const dayRecs = allRecs.slice(d * recsPerDay, (d + 1) * recsPerDay)
      const dateObj = new Date(loc.startDate)
      dateObj.setDate(dateObj.getDate() + d)
      const dateStr = dateObj.toISOString().split('T')[0]

      plans.push({
        day: d + 1,
        date: dateStr,
        recs: dayRecs,
        slots: assignRecsToSlots(dayRecs),
      })
    }

    return plans
  }, [selectedLocIdx, favorites, locations])

  const selectedLoc = locations[selectedLocIdx]

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
          <h1 className="font-bold text-lg">📅 Tagesplan</h1>
          <p className="text-xs text-chile-text-muted">Vorgeschlagener Ablauf pro Tag</p>
        </div>
      </div>

      {/* Location Tabs */}
      <div className="flex-shrink-0 border-b border-white/5 bg-chile-bg-card/50">
        <div className="flex overflow-x-auto scrollbar-hide px-2 py-2 gap-1.5">
          {locations.map((loc, idx) => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocIdx(idx)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                idx === selectedLocIdx
                  ? 'bg-chile-accent-red text-white'
                  : 'bg-white/5 text-chile-text-muted hover:bg-white/10'
              }`}
            >
              <span className="mr-1">{idx + 1}.</span>
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Day Plans */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Location Summary */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-chile-accent-red/20 flex items-center justify-center text-lg font-bold text-chile-accent-red">
            {selectedLocIdx + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold">{selectedLoc?.name}</div>
            <div className="text-xs text-chile-text-muted">
              {formatDate(selectedLoc?.startDate || '')} – {formatDate(selectedLoc?.endDate || '')} • {selectedLoc?.durationDays} {selectedLoc?.durationDays === 1 ? 'Tag' : 'Tage'} • {selectedLoc?.recommendations.length} Empfehlungen
            </div>
          </div>
        </div>

        {/* Day Cards */}
        {dayPlans.map((plan) => (
          <div key={plan.day} className="rounded-xl bg-white/5 border border-white/5 overflow-hidden">
            {/* Day Header */}
            <div className="px-4 py-2.5 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-chile-accent-teal/20 text-chile-accent-teal flex items-center justify-center text-xs font-bold">
                  {plan.day}
                </span>
                <span className="font-medium text-sm">{formatDate(plan.date)}</span>
              </div>
              <span className="text-xs text-chile-text-muted">{plan.recs.length} Aktivitäten</span>
            </div>

            {/* Time Slots */}
            <div className="divide-y divide-white/5">
              {TIME_SLOTS.map((slot) => {
                const slotRecs = plan.slots[slot.id]
                if (!slotRecs || slotRecs.length === 0) return null
                return (
                  <div key={slot.id} className="px-4 py-2.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm">{slot.icon}</span>
                      <span className="text-xs font-medium text-chile-text-secondary">{slot.label}</span>
                      <span className="text-[10px] text-chile-text-muted">{slot.time}</span>
                    </div>
                    <div className="space-y-1.5 ml-6">
                      {slotRecs.map((rec) => (
                        <div
                          key={rec.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="text-base flex-shrink-0">
                            {CATEGORY_ICONS[rec.category.toLowerCase()] || '📍'}
                          </span>
                          <span className="truncate flex-1">{rec.name}</span>
                          {favorites.has(rec.id) && (
                            <span className="text-xs flex-shrink-0">❤️</span>
                          )}
                          {rec.priceRange && (
                            <span className="text-[10px] text-chile-text-muted flex-shrink-0">{rec.priceRange}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Footer hint */}
        <div className="text-[10px] text-chile-text-muted text-center pb-4 leading-relaxed">
          💡 Favoriten (❤️) werden bevorzugt eingeplant. Der Plan ist ein Vorschlag — spontan bleiben! 🇨🇱
        </div>
      </div>
    </div>
  )
}
