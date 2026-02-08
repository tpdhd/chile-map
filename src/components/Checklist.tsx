import { useState, useEffect, useCallback } from 'react'

const CHECKLIST_KEY = 'chile-trip-checklist'

interface ChecklistItem {
  id: string
  text: string
  checked: boolean
  category: string
}

const DEFAULT_ITEMS: Omit<ChecklistItem, 'checked'>[] = [
  // Dokumente
  { id: 'doc-1', text: 'Reisepass (6+ Monate gültig)', category: 'Dokumente' },
  { id: 'doc-2', text: 'Flugtickets / Boarding Passes', category: 'Dokumente' },
  { id: 'doc-3', text: 'Reiseversicherung (Nachweis)', category: 'Dokumente' },
  { id: 'doc-4', text: 'Führerschein (international)', category: 'Dokumente' },
  { id: 'doc-5', text: 'Hotelreservierungen', category: 'Dokumente' },
  { id: 'doc-6', text: 'Mietwagen-Buchung', category: 'Dokumente' },
  { id: 'doc-7', text: 'Hochzeitseinladung', category: 'Dokumente' },
  { id: 'doc-8', text: 'Kopien aller Dokumente (digital)', category: 'Dokumente' },
  { id: 'doc-9', text: 'Kreditkarte (ohne Auslandsgebühren)', category: 'Dokumente' },
  { id: 'doc-10', text: 'Bargeld (Euro zum Tauschen)', category: 'Dokumente' },

  // Technik
  { id: 'tech-1', text: 'Handy + Ladekabel', category: 'Technik' },
  { id: 'tech-2', text: 'Powerbank', category: 'Technik' },
  { id: 'tech-3', text: 'Kamera + Speicherkarten', category: 'Technik' },
  { id: 'tech-4', text: 'Reiseadapter (Typ C/L für Chile)', category: 'Technik' },
  { id: 'tech-5', text: 'Kopfhörer', category: 'Technik' },
  { id: 'tech-6', text: 'Offline-Karten heruntergeladen', category: 'Technik' },

  // Kleidung
  { id: 'cloth-1', text: 'Wanderschuhe (eingelaufen!)', category: 'Kleidung' },
  { id: 'cloth-2', text: 'Regenjacke', category: 'Kleidung' },
  { id: 'cloth-3', text: 'Fleece / Warme Schicht', category: 'Kleidung' },
  { id: 'cloth-4', text: 'T-Shirts (5-7)', category: 'Kleidung' },
  { id: 'cloth-5', text: 'Lange Hosen (2-3)', category: 'Kleidung' },
  { id: 'cloth-6', text: 'Kurze Hose', category: 'Kleidung' },
  { id: 'cloth-7', text: 'Badehose / Badesachen', category: 'Kleidung' },
  { id: 'cloth-8', text: 'Hochzeits-Outfit', category: 'Kleidung' },
  { id: 'cloth-9', text: 'Socken & Unterwäsche', category: 'Kleidung' },
  { id: 'cloth-10', text: 'Sandalen / Flip-Flops', category: 'Kleidung' },
  { id: 'cloth-11', text: 'Mütze / Cap', category: 'Kleidung' },
  { id: 'cloth-12', text: 'Sonnenbrille', category: 'Kleidung' },

  // Toilettenartikel
  { id: 'toil-1', text: 'Sonnencreme (SPF 50+)', category: 'Toilettenartikel' },
  { id: 'toil-2', text: 'Zahnbürste & Zahnpasta', category: 'Toilettenartikel' },
  { id: 'toil-3', text: 'Deo', category: 'Toilettenartikel' },
  { id: 'toil-4', text: 'Shampoo / Duschgel (Reisegröße)', category: 'Toilettenartikel' },
  { id: 'toil-5', text: 'Insektenschutz', category: 'Toilettenartikel' },
  { id: 'toil-6', text: 'Reiseapotheke', category: 'Toilettenartikel' },
  { id: 'toil-7', text: 'Pflaster / Blasenpflaster', category: 'Toilettenartikel' },
  { id: 'toil-8', text: 'Ibuprofen / Schmerzmittel', category: 'Toilettenartikel' },

  // Reise-Essentials
  { id: 'ess-1', text: 'Tagesrucksack', category: 'Reise-Essentials' },
  { id: 'ess-2', text: 'Trinkflasche', category: 'Reise-Essentials' },
  { id: 'ess-3', text: 'Nackenkissen (Flug)', category: 'Reise-Essentials' },
  { id: 'ess-4', text: 'Schlafmaske & Ohrstöpsel', category: 'Reise-Essentials' },
  { id: 'ess-5', text: 'Taschenlampe / Stirnlampe', category: 'Reise-Essentials' },
  { id: 'ess-6', text: 'Drybag (für Thermalquellen)', category: 'Reise-Essentials' },
  { id: 'ess-7', text: 'Fernglas (optional, Natur)', category: 'Reise-Essentials' },
  { id: 'ess-8', text: 'Spanisch-Spickzettel', category: 'Reise-Essentials' },

  // Vor Abreise
  { id: 'pre-1', text: 'Nachbarn informiert (Post, Blumen)', category: 'Vor Abreise' },
  { id: 'pre-2', text: 'Bank informiert (Auslandseinsatz)', category: 'Vor Abreise' },
  { id: 'pre-3', text: 'Roaming / SIM-Karte geklärt', category: 'Vor Abreise' },
  { id: 'pre-4', text: 'Wohnung: Heizung, Fenster, Wasser', category: 'Vor Abreise' },
  { id: 'pre-5', text: 'Chile Map App offline verfügbar', category: 'Vor Abreise' },
]

const CATEGORY_ICONS: Record<string, string> = {
  'Dokumente': '📄',
  'Technik': '📱',
  'Kleidung': '👕',
  'Toilettenartikel': '🧴',
  'Reise-Essentials': '🎒',
  'Vor Abreise': '✅',
  'Eigene': '📝',
}

interface ChecklistProps {
  onClose: () => void
}

export default function Checklist({ onClose }: ChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(['Dokumente']))
  const [newItemText, setNewItemText] = useState('')
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null)

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHECKLIST_KEY)
      if (saved) {
        setItems(JSON.parse(saved))
      } else {
        // Initialize with defaults
        setItems(DEFAULT_ITEMS.map(item => ({ ...item, checked: false })))
      }
    } catch {
      setItems(DEFAULT_ITEMS.map(item => ({ ...item, checked: false })))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(items))
    }
  }, [items])

  const toggleItem = useCallback((id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }, [])

  const toggleCategory = useCallback((cat: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev)
      if (next.has(cat)) {
        next.delete(cat)
      } else {
        next.add(cat)
      }
      return next
    })
  }, [])

  const addCustomItem = useCallback((category: string) => {
    if (!newItemText.trim()) return
    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      text: newItemText.trim(),
      checked: false,
      category,
    }
    setItems(prev => [...prev, newItem])
    setNewItemText('')
    setAddingToCategory(null)
  }, [newItemText])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const resetAll = useCallback(() => {
    if (confirm('Alle Häkchen zurücksetzen?')) {
      setItems(prev => prev.map(item => ({ ...item, checked: false })))
    }
  }, [])

  // Group by category
  const categories = [...new Set(items.map(item => item.category))]
  const totalChecked = items.filter(i => i.checked).length
  const totalItems = items.length
  const progress = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0

  return (
    <div className="absolute inset-0 z-[700] flex flex-col bg-chile-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-chile-bg-card/95 backdrop-blur-sm" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="font-bold text-lg">🧳 Packliste</h1>
            <p className="text-xs text-chile-text-muted">{totalChecked} / {totalItems} erledigt</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetAll}
            className="px-3 py-1.5 rounded-lg bg-white/10 text-xs hover:bg-white/20 transition-colors"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2 bg-chile-bg-card/50">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${progress}%`,
                background: progress === 100 
                  ? 'linear-gradient(90deg, #22c55e, #4ade80)' 
                  : 'linear-gradient(90deg, #e63946, #f97316)'
              }}
            />
          </div>
          <span className={`text-sm font-bold ${progress === 100 ? 'text-green-400' : 'text-chile-accent-red'}`}>
            {progress}%
          </span>
        </div>
      </div>

      {/* Category List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 pb-8">
        {categories.map(cat => {
          const catItems = items.filter(i => i.category === cat)
          const catChecked = catItems.filter(i => i.checked).length
          const isExpanded = expandedCats.has(cat)
          const allDone = catChecked === catItems.length

          return (
            <div key={cat} className="rounded-xl overflow-hidden border border-white/5">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(cat)}
                className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                  allDone ? 'bg-green-500/10' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className="text-lg">{CATEGORY_ICONS[cat] || '📋'}</span>
                <div className="flex-1 text-left">
                  <span className={`font-medium ${allDone ? 'text-green-400' : ''}`}>
                    {cat}
                  </span>
                  <span className="text-xs text-chile-text-muted ml-2">
                    {catChecked}/{catItems.length}
                  </span>
                </div>
                {allDone && <span className="text-green-400">✓</span>}
                <span className="text-chile-text-muted text-sm">{isExpanded ? '▲' : '▼'}</span>
              </button>

              {/* Items */}
              {isExpanded && (
                <div className="divide-y divide-white/5">
                  {catItems.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                        item.checked ? 'bg-green-500/5' : 'hover:bg-white/5'
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          item.checked 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-white/30 hover:border-white/50'
                        }`}
                      >
                        {item.checked && '✓'}
                      </button>
                      <span className={`flex-1 text-sm ${item.checked ? 'line-through text-chile-text-muted' : ''}`}>
                        {item.text}
                      </span>
                      {item.id.startsWith('custom-') && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-chile-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {/* Add custom item */}
                  {addingToCategory === cat ? (
                    <div className="flex items-center gap-2 px-4 py-2">
                      <input
                        type="text"
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addCustomItem(cat)
                          if (e.key === 'Escape') { setAddingToCategory(null); setNewItemText('') }
                        }}
                        placeholder="Neuer Eintrag..."
                        className="flex-1 bg-white/5 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-chile-accent-red/50 border border-white/10"
                        autoFocus
                      />
                      <button
                        onClick={() => addCustomItem(cat)}
                        className="px-3 py-1.5 rounded-lg bg-chile-accent-red text-white text-sm"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingToCategory(cat)}
                      className="w-full px-4 py-2 text-left text-sm text-chile-text-muted hover:bg-white/5 transition-colors"
                    >
                      + Hinzufügen...
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Add new category */}
        {addingToCategory === '__new__' ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newItemText.trim()) {
                  const newItem: ChecklistItem = {
                    id: `custom-${Date.now()}`,
                    text: newItemText.trim(),
                    checked: false,
                    category: 'Eigene',
                  }
                  setItems(prev => [...prev, newItem])
                  setNewItemText('')
                  setAddingToCategory(null)
                  setExpandedCats(prev => new Set([...prev, 'Eigene']))
                }
                if (e.key === 'Escape') { setAddingToCategory(null); setNewItemText('') }
              }}
              placeholder="Neuer Eintrag (Eigene Kategorie)..."
              className="flex-1 bg-transparent text-sm focus:outline-none"
              autoFocus
            />
          </div>
        ) : (
          <button
            onClick={() => setAddingToCategory('__new__')}
            className="w-full px-4 py-3 rounded-xl text-center text-sm text-chile-text-muted bg-white/5 hover:bg-white/10 transition-colors border border-dashed border-white/10"
          >
            + Eigenen Eintrag hinzufügen
          </button>
        )}
      </div>
    </div>
  )
}
