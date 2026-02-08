import { useState, useMemo, useRef } from 'react'
import phrasesData from '../data/phrases.json'

interface PhrasebookProps {
  onClose: () => void
}

type Phrase = {
  de: string
  es: string
  pronunciation: string
  note?: string
}

type Category = {
  id: string
  name: string
  icon: string
  phrases: Phrase[]
}

export default function Phrasebook({ onClose }: PhrasebookProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('basics')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedPhrase, setExpandedPhrase] = useState<number | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const categories = phrasesData.categories as Category[]

  const currentCategory = useMemo(() => {
    return categories.find(c => c.id === selectedCategory) || categories[0]
  }, [selectedCategory, categories])

  // Search across all categories
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null
    const q = searchQuery.toLowerCase().trim()
    const results: Array<{ phrase: Phrase; categoryName: string; categoryIcon: string }> = []
    for (const cat of categories) {
      for (const phrase of cat.phrases) {
        if (
          phrase.de.toLowerCase().includes(q) ||
          phrase.es.toLowerCase().includes(q) ||
          (phrase.note && phrase.note.toLowerCase().includes(q))
        ) {
          results.push({ phrase, categoryName: cat.name, categoryIcon: cat.icon })
        }
      }
    }
    return results
  }, [searchQuery, categories])

  const totalPhrases = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.phrases.length, 0)
  }, [categories])

  const renderPhrase = (phrase: Phrase, index: number, showCategory?: { name: string; icon: string }) => {
    const isExpanded = expandedPhrase === index
    return (
      <button
        key={`${phrase.de}-${index}`}
        onClick={() => setExpandedPhrase(isExpanded ? null : index)}
        className={`
          w-full text-left p-3 rounded-xl transition-all duration-200
          ${isExpanded 
            ? 'bg-gradient-to-r from-chile-accent-red/20 to-chile-accent-teal/10 ring-1 ring-chile-accent-red/30' 
            : 'bg-white/5 hover:bg-white/10 active:scale-[0.98]'
          }
        `}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* German */}
            <div className="text-sm text-chile-text-muted mb-0.5">{phrase.de}</div>
            {/* Spanish - prominent */}
            <div className={`font-semibold ${isExpanded ? 'text-lg text-chile-accent-red' : 'text-base'}`}>
              {phrase.es}
            </div>
          </div>
          {showCategory && (
            <span className="text-xs text-chile-text-muted bg-white/10 px-2 py-0.5 rounded-full flex-shrink-0">
              {showCategory.icon} {showCategory.name}
            </span>
          )}
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-white/10 space-y-1.5">
            {phrase.pronunciation && (
              <div className="flex items-center gap-2">
                <span className="text-chile-text-muted text-xs">🗣️</span>
                <span className="text-sm font-mono text-chile-accent-teal">{phrase.pronunciation}</span>
              </div>
            )}
            {phrase.note && (
              <div className="flex items-start gap-2">
                <span className="text-chile-text-muted text-xs mt-0.5">💡</span>
                <span className="text-sm text-chile-text-secondary italic">{phrase.note}</span>
              </div>
            )}
          </div>
        )}
      </button>
    )
  }

  return (
    <div className="absolute inset-0 z-[700] bg-chile-bg-primary animate-slide-up">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-chile-bg-primary/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-4 pt-4 pb-2" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              ←
            </button>
            <div>
              <h1 className="font-bold text-lg">🗣️ Sprachführer</h1>
              <p className="text-xs text-chile-text-muted">{totalPhrases} Phrasen • Chilenisches Spanisch</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <input
            ref={searchRef}
            type="search"
            enterKeyHint="search"
            placeholder="Suche auf Deutsch oder Spanisch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 rounded-xl text-sm placeholder:text-chile-text-muted focus:outline-none focus:ring-1 focus:ring-chile-accent-red/50 border border-white/10"
          />
        </div>

        {/* Category Tabs - Only show when not searching */}
        {!searchQuery && (
          <div className="flex gap-1 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id)
                  setExpandedPhrase(null)
                }}
                className={`
                  px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex items-center gap-1 transition-all
                  ${selectedCategory === cat.id 
                    ? 'bg-chile-accent-red text-white' 
                    : 'bg-white/10 hover:bg-white/15'
                  }
                `}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="overflow-y-auto px-4 py-3 space-y-2" style={{ maxHeight: 'calc(100dvh - 160px)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}>
        {searchQuery && searchResults ? (
          <>
            <div className="text-xs text-chile-text-muted mb-2">
              {searchResults.length} Ergebnis{searchResults.length !== 1 ? 'se' : ''} für „{searchQuery}"
            </div>
            {searchResults.length === 0 && (
              <div className="text-center py-12 text-chile-text-muted">
                <div className="text-4xl mb-3">🤷</div>
                <p>Kein Ergebnis für „{searchQuery}"</p>
              </div>
            )}
            {searchResults.map((result, idx) => 
              renderPhrase(result.phrase, idx, { name: result.categoryName, icon: result.categoryIcon })
            )}
          </>
        ) : (
          <>
            {/* Category header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{currentCategory.icon}</span>
              <div>
                <h2 className="font-bold">{currentCategory.name}</h2>
                <p className="text-xs text-chile-text-muted">{currentCategory.phrases.length} Phrasen</p>
              </div>
            </div>

            {/* Phrases */}
            {currentCategory.phrases.map((phrase, idx) => renderPhrase(phrase, idx))}

            {/* Chilenisch hint */}
            {selectedCategory !== 'chilean' && (
              <button
                onClick={() => { setSelectedCategory('chilean'); setExpandedPhrase(null) }}
                className="w-full mt-4 p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-blue-500/10 border border-white/10 text-center"
              >
                <span className="text-lg">🇨🇱</span>
                <p className="text-sm text-chile-text-secondary mt-1">
                  Tipp: Schau dir die <span className="text-chile-accent-red font-medium">Chilenischen Slang-Wörter</span> an!
                </p>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
