import { useState, useEffect } from 'react'
import shopsData from '../data/suit-guide-shops.json'
import contentData from '../data/suit-guide-content.json'

// ==================== INTERFACES ====================

interface Shop {
  name: string
  category: string
  address: string
  district: string
  website: string | null
  mapsUrl?: string
  priceRange: string
  rating: number
  ratingSource: string
  hasStretchSuits: boolean
  stretchNote?: string
  alteration: string
  consultation: string
  highlights: string[]
  bestFor: string
  coordinates: [number, number]
}

interface ContentSection {
  id: string
  title: string
  icon: string
  items: ContentItem[]
}

interface ContentItem {
  heading?: string
  content: string | string[]
  type?: 'info' | 'warning' | 'success' | 'tip'
  table?: {
    headers: string[]
    rows: string[][]
  }
}

interface ChecklistItem {
  item: string
  category: string
  priority: number
}

interface QuickTip {
  tip: string
  icon: string
}

interface BudgetTier {
  name: string
  range: string
  description: string
  shops: string[]
}

interface ShoppingChecklistItem {
  item: string
  reason: string
  priority: 'must' | 'should' | 'nice'
}

interface ContentData {
  sections: ContentSection[]
  quickTips: QuickTip[]
  checklist: ChecklistItem[]
  shoppingChecklist?: ShoppingChecklistItem[]
  budgetBreakdown: {
    tiers: BudgetTier[]
  }
}

interface SuitGuideProps {
  onClose: () => void
}

// ==================== COMPONENT ====================

export default function SuitGuide({ onClose }: SuitGuideProps) {
  const [activeTab, setActiveTab] = useState<'shops' | 'fabrics' | 'etiquette' | 'checklist' | 'tips'>('shops')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'price' | 'rating'>('rating')
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  const shops = shopsData as Shop[]
  const content = contentData as ContentData

  // Load checklist progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('suitGuideChecklist')
    if (saved) {
      setCheckedItems(new Set(JSON.parse(saved)))
    }
  }, [])

  // Save checklist progress to localStorage
  const toggleChecklistItem = (item: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(item)) {
      newChecked.delete(item)
    } else {
      newChecked.add(item)
    }
    setCheckedItems(newChecked)
    localStorage.setItem('suitGuideChecklist', JSON.stringify([...newChecked]))
  }

  // Filter and sort shops
  const categories = ['all', 'Budget', 'Mittelklasse', 'Premium', 'Schneider', 'Online', 'Second-Hand']
  const filteredShops = shops.filter(shop => 
    selectedCategory === 'all' || shop.category === selectedCategory
  ).sort((a, b) => {
    if (sortBy === 'price') {
      const priceOrder = { '€': 1, '€€': 2, '€€€': 3, '€€€€': 4 }
      return priceOrder[a.priceRange as keyof typeof priceOrder] - priceOrder[b.priceRange as keyof typeof priceOrder]
    } else {
      return b.rating - a.rating
    }
  })

  // Checklist progress
  const checklistByCategory = content.checklist.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ChecklistItem[]>)

  const totalItems = content.checklist.length
  const completedItems = checkedItems.size
  const progress = Math.round((completedItems / totalItems) * 100)

  const tabs = [
    { id: 'shops' as const, icon: '👔', label: 'Läden' },
    { id: 'fabrics' as const, icon: '🧵', label: 'Stoffe' },
    { id: 'etiquette' as const, icon: '🎩', label: 'Etikette' },
    { id: 'checklist' as const, icon: '✅', label: 'Checkliste' },
    { id: 'tips' as const, icon: '💡', label: 'Quick-Tips' },
  ]

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
          <h1 className="font-bold text-lg">👔 Anzug-Guide Hamburg</h1>
          <p className="text-xs text-chile-text-muted truncate">Für die Chile-Hochzeit • März 2026</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 overflow-x-auto px-4 py-3 scrollbar-hide bg-chile-bg-primary border-b border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap flex items-center gap-1 transition-all ${
              activeTab === tab.id ? 'bg-chile-accent-red text-white' : 'bg-white/10'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">

        {/* ==================== SHOPS TAB ==================== */}
        {activeTab === 'shops' && (
          <div className="space-y-4 mt-4">
            {/* Filter & Sort */}
            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-1 flex-wrap flex-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs transition-all ${
                      selectedCategory === cat 
                        ? 'bg-chile-accent-teal text-white' 
                        : 'bg-white/10 text-chile-text-muted'
                    }`}
                  >
                    {cat === 'all' ? 'Alle' : cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setSortBy('rating')}
                  className={`px-3 py-1 rounded-full text-xs ${
                    sortBy === 'rating' ? 'bg-amber-500 text-white' : 'bg-white/10'
                  }`}
                >
                  ⭐ Rating
                </button>
                <button
                  onClick={() => setSortBy('price')}
                  className={`px-3 py-1 rounded-full text-xs ${
                    sortBy === 'price' ? 'bg-amber-500 text-white' : 'bg-white/10'
                  }`}
                >
                  💰 Preis
                </button>
              </div>
            </div>

            {/* Shop Cards */}
            <div className="space-y-3">
              {filteredShops.map(shop => (
                <div 
                  key={shop.name}
                  className="p-4 rounded-xl bg-chile-bg-card border border-white/5 hover:border-chile-accent-teal/30 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-chile-text-primary">{shop.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-chile-text-muted">{shop.district}</span>
                        {shop.hasStretchSuits && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-chile-accent-teal/20 text-chile-accent-teal font-bold">
                            🧘 Stretch
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        shop.rating >= 4.5 ? 'bg-chile-accent-teal text-white' : 
                        shop.rating >= 4.0 ? 'bg-amber-500/80 text-white' : 'bg-red-500 text-white'
                      }`}>
                        ⭐ {shop.rating}
                      </span>
                      <span className="text-lg font-bold text-amber-400">{shop.priceRange}</span>
                    </div>
                  </div>

                  {/* Stretch Note */}
                  {shop.stretchNote && (
                    <div className="mb-2 p-2 rounded-lg bg-chile-accent-teal/10 border-l-2 border-chile-accent-teal">
                      <p className="text-xs text-chile-text-secondary">{shop.stretchNote}</p>
                    </div>
                  )}

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mb-3">
                    <div className="text-chile-text-muted">Kategorie</div>
                    <div className="text-chile-text-primary font-medium">{shop.category}</div>
                    <div className="text-chile-text-muted">Änderungen</div>
                    <div className="text-chile-text-primary">{shop.alteration}</div>
                    <div className="text-chile-text-muted">Beratung</div>
                    <div className="text-chile-text-primary">{shop.consultation}</div>
                    <div className="text-chile-text-muted">Bewertung</div>
                    <div className="text-chile-text-primary">{shop.ratingSource}</div>
                  </div>

                  {/* Highlights */}
                  <div className="mb-3">
                    <div className="text-xs font-bold text-chile-text-muted mb-1">Highlights:</div>
                    <div className="flex flex-wrap gap-1">
                      {shop.highlights.map((highlight, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-chile-text-secondary">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Best For */}
                  <div className="mb-3 p-2 rounded-lg bg-amber-500/10 border-l-2 border-amber-500">
                    <span className="text-xs text-amber-400 font-bold">💡 Ideal für: </span>
                    <span className="text-xs text-chile-text-secondary">{shop.bestFor}</span>
                  </div>

                  {/* Links */}
                  <div className="flex gap-2">
                    {shop.website && (
                      <a
                        href={shop.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 rounded-lg bg-chile-accent-teal/20 text-chile-accent-teal text-xs font-medium text-center hover:bg-chile-accent-teal/30 transition-colors"
                      >
                        🌐 Website
                      </a>
                    )}
                    <a
                      href={shop.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.name + ' Hamburg')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${shop.website ? 'flex-1' : 'w-full'} px-3 py-2 rounded-lg bg-chile-accent-red/20 text-chile-accent-red text-xs font-medium text-center hover:bg-chile-accent-red/30 transition-colors`}
                    >
                      📍 Maps
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== FABRICS TAB ==================== */}
        {activeTab === 'fabrics' && (
          <div className="space-y-4 mt-4">
            {content.sections
              .filter(section => section.id === 'fabrics')
              .map(section => (
                <div key={section.id}>
                  <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <span>{section.icon}</span>
                    <span>{section.title}</span>
                  </h2>
                  {section.items.map((item, idx) => (
                    <div key={idx} className="mb-4">
                      {item.heading && (
                        <h3 className="font-bold text-sm mb-2 text-chile-text-primary">{item.heading}</h3>
                      )}
                      
                      {typeof item.content === 'string' ? (
                        <div className={`p-3 rounded-xl border-l-4 text-sm ${
                          item.type === 'warning' ? 'bg-red-500/10 border-red-500 text-chile-text-secondary' :
                          item.type === 'success' ? 'bg-chile-accent-teal/10 border-chile-accent-teal text-chile-text-secondary' :
                          item.type === 'tip' ? 'bg-amber-500/10 border-amber-500 text-chile-text-secondary' :
                          'bg-white/5 border-white/5 text-chile-text-secondary'
                        }`}>
                          {item.content}
                        </div>
                      ) : (
                        <div className={`p-3 rounded-xl border-l-4 text-sm ${
                          item.type === 'warning' ? 'bg-red-500/10 border-red-500' :
                          item.type === 'success' ? 'bg-chile-accent-teal/10 border-chile-accent-teal' :
                          item.type === 'tip' ? 'bg-amber-500/10 border-amber-500' :
                          'bg-white/5 border-white/5'
                        }`}>
                          <ul className="space-y-1.5">
                            {item.content.map((line, i) => (
                              <li key={i} className="flex gap-2 text-xs text-chile-text-secondary">
                                <span className="flex-shrink-0">→</span>
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.table && (
                        <div className="mt-3 overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-white/10">
                                {item.table.headers.map((header, i) => (
                                  <th key={i} className="px-3 py-2 text-left text-chile-text-muted font-bold">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {item.table.rows.map((row, i) => (
                                <tr key={i} className="border-b border-white/5">
                                  {row.map((cell, j) => (
                                    <td key={j} className="px-3 py-2 text-chile-text-secondary">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
          </div>
        )}

        {/* ==================== ETIQUETTE TAB ==================== */}
        {activeTab === 'etiquette' && (
          <div className="space-y-4 mt-4">
            {content.sections
              .filter(section => ['etiquette', 'transport', 'gifts', 'emergency'].includes(section.id))
              .map(section => (
                <div key={section.id}>
                  <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <span>{section.icon}</span>
                    <span>{section.title}</span>
                  </h2>
                  {section.items.map((item, idx) => (
                    <div key={idx} className="mb-4">
                      {item.heading && (
                        <h3 className="font-bold text-sm mb-2 text-chile-text-primary">{item.heading}</h3>
                      )}
                      
                      {typeof item.content === 'string' ? (
                        <div className={`p-3 rounded-xl border-l-4 text-sm ${
                          item.type === 'warning' ? 'bg-red-500/10 border-red-500 text-chile-text-secondary' :
                          item.type === 'success' ? 'bg-chile-accent-teal/10 border-chile-accent-teal text-chile-text-secondary' :
                          item.type === 'tip' ? 'bg-amber-500/10 border-amber-500 text-chile-text-secondary' :
                          'bg-white/5 border-white/5 text-chile-text-secondary'
                        }`}>
                          {item.content}
                        </div>
                      ) : (
                        <div className={`p-3 rounded-xl border-l-4 text-sm ${
                          item.type === 'warning' ? 'bg-red-500/10 border-red-500' :
                          item.type === 'success' ? 'bg-chile-accent-teal/10 border-chile-accent-teal' :
                          item.type === 'tip' ? 'bg-amber-500/10 border-amber-500' :
                          'bg-white/5 border-white/5'
                        }`}>
                          <ul className="space-y-1.5">
                            {item.content.map((line, i) => (
                              <li key={i} className="flex gap-2 text-xs text-chile-text-secondary">
                                <span className="flex-shrink-0">→</span>
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
          </div>
        )}

        {/* ==================== CHECKLIST TAB ==================== */}
        {activeTab === 'checklist' && (
          <div className="space-y-4 mt-4">
            {/* Shopping Checklist - Was zum Laden mitnehmen */}
            {content.shoppingChecklist && content.shoppingChecklist.length > 0 && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                <h3 className="font-bold text-sm text-amber-400 mb-3 flex items-center gap-2">
                  🛍️ Was du zum Anzugkauf mitnehmen solltest
                </h3>
                <div className="space-y-2">
                  {content.shoppingChecklist.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-bold mt-0.5 ${
                        item.priority === 'must' ? 'bg-red-500/20 text-red-400' :
                        item.priority === 'should' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-white/10 text-chile-text-muted'
                      }`}>
                        {item.priority === 'must' ? '!!!' : item.priority === 'should' ? '!!' : '!'}
                      </span>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-chile-text-primary">{item.item}</span>
                        <p className="text-xs text-chile-text-muted mt-0.5">{item.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-chile-accent-teal/20 to-chile-accent-red/10 border border-chile-accent-teal/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-chile-text-primary">Fortschritt</span>
                <span className="text-lg font-bold text-chile-accent-teal">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-chile-accent-teal to-chile-accent-red transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-chile-text-muted mt-2">
                {completedItems} von {totalItems} erledigt
              </div>
            </div>

            {/* Checklist by Category */}
            {Object.entries(checklistByCategory)
              .sort((a, b) => {
                const order = { 'Kleidung': 1, 'Accessoires': 2, 'Pflege': 3, 'Vorbereitung': 4 }
                return (order[a[0] as keyof typeof order] || 99) - (order[b[0] as keyof typeof order] || 99)
              })
              .map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <h3 className="font-bold text-sm text-chile-text-primary flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      items.every(item => checkedItems.has(item.item))
                        ? 'bg-chile-accent-teal text-white'
                        : 'bg-white/10 text-chile-text-muted'
                    }`}>
                      {items.filter(item => checkedItems.has(item.item)).length}/{items.length}
                    </span>
                    {category}
                  </h3>
                  <div className="space-y-1.5">
                    {items
                      .sort((a, b) => b.priority - a.priority)
                      .map(item => {
                        const isChecked = checkedItems.has(item.item)
                        return (
                          <label
                            key={item.item}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                              isChecked 
                                ? 'bg-chile-accent-teal/10 border border-chile-accent-teal/30' 
                                : 'bg-white/5 border border-white/5 hover:bg-white/10'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleChecklistItem(item.item)}
                              className="w-5 h-5 rounded border-2 border-chile-accent-teal bg-transparent checked:bg-chile-accent-teal transition-all cursor-pointer"
                            />
                            <span className={`flex-1 text-sm ${
                              isChecked 
                                ? 'text-chile-text-muted line-through' 
                                : 'text-chile-text-primary'
                            }`}>
                              {item.item}
                            </span>
                            {item.priority >= 9 && !isChecked && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-chile-accent-red/20 text-chile-accent-red font-bold">
                                Wichtig
                              </span>
                            )}
                          </label>
                        )
                      })}
                  </div>
                </div>
              ))}

            {/* Reset Button */}
            {completedItems > 0 && (
              <button
                onClick={() => {
                  setCheckedItems(new Set())
                  localStorage.removeItem('suitGuideChecklist')
                }}
                className="w-full px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
              >
                🔄 Checkliste zurücksetzen
              </button>
            )}
          </div>
        )}

        {/* ==================== QUICK TIPS TAB ==================== */}
        {activeTab === 'tips' && (
          <div className="space-y-4 mt-4">
            {/* Budget Overview */}
            <div>
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span>💰</span>
                <span>Budget-Übersicht</span>
              </h2>
              <div className="space-y-2">
                {content.budgetBreakdown.tiers.map((tier, idx) => (
                  <div 
                    key={tier.name}
                    className={`p-4 rounded-xl border ${
                      idx === 1 
                        ? 'bg-chile-accent-teal/10 border-chile-accent-teal/30' 
                        : 'bg-white/5 border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm text-chile-text-primary">{tier.name}</h3>
                      <span className="text-lg font-bold text-amber-400">{tier.range}</span>
                    </div>
                    <p className="text-xs text-chile-text-secondary mb-2">{tier.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {tier.shops.map(shop => (
                        <span key={shop} className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-chile-text-muted">
                          {shop}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div>
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span>⚡</span>
                <span>Die 5 wichtigsten Regeln</span>
              </h2>
              <div className="space-y-2">
                {content.quickTips.slice(0, 5).map((tip, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-gradient-to-r from-chile-accent-red/10 to-chile-accent-teal/5 border border-chile-accent-red/20 flex items-start gap-3"
                  >
                    <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-full bg-chile-accent-red flex items-center justify-center text-white text-xs font-bold">
                          {idx + 1}
                        </span>
                      </div>
                      <p className="text-sm text-chile-text-secondary">{tip.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Mistakes */}
            <div>
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span>⚠️</span>
                <span>Häufige Fehler</span>
              </h2>
              <div className="space-y-2">
                {content.quickTips.slice(5).map((tip, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-red-500/10 border-l-4 border-red-500"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{tip.icon}</span>
                      <p className="text-sm text-chile-text-secondary">{tip.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
