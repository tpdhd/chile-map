import { useState, useEffect, useCallback } from 'react'

interface CurrencyConverterProps {
  onClose: () => void
}

const RATE_CACHE_KEY = 'chile-clp-eur-rate'
const RATE_CACHE_TS_KEY = 'chile-clp-eur-rate-ts'
const RATE_CACHE_TTL = 1000 * 60 * 60 * 6 // 6 hours

// Common amounts for quick conversion
const QUICK_AMOUNTS_CLP = [1000, 2000, 5000, 10000, 20000, 50000, 100000]
const QUICK_AMOUNTS_EUR = [1, 2, 5, 10, 20, 50, 100]

// Tipping guide for Chile
const TIPPING_GUIDE = [
  { place: 'Restaurant', tip: '10% (oft inkludiert)', icon: '🍽️' },
  { place: 'Café/Bar', tip: 'Aufrunden', icon: '☕' },
  { place: 'Taxi', tip: 'Aufrunden auf 100er', icon: '🚕' },
  { place: 'Hotel', tip: '1.000-2.000 CLP/Tag', icon: '🏨' },
  { place: 'Tour Guide', tip: '5.000-10.000 CLP', icon: '🧑‍🏫' },
]

export default function CurrencyConverter({ onClose }: CurrencyConverterProps) {
  const [clpToEur, setClpToEur] = useState<number>(0.000988) // ~1012 CLP = 1 EUR fallback
  const [rateDate, setRateDate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [inputCLP, setInputCLP] = useState('')
  const [inputEUR, setInputEUR] = useState('')
  const [direction, setDirection] = useState<'clp-to-eur' | 'eur-to-clp'>('clp-to-eur')
  const [showTipping, setShowTipping] = useState(false)

  // Load cached rate or fetch
  useEffect(() => {
    const cached = localStorage.getItem(RATE_CACHE_KEY)
    const cachedTs = localStorage.getItem(RATE_CACHE_TS_KEY)
    
    if (cached && cachedTs) {
      const ts = parseInt(cachedTs)
      setClpToEur(parseFloat(cached))
      setRateDate(new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }))
      
      if (Date.now() - ts < RATE_CACHE_TTL) return // Still fresh
    }
    
    fetchRate()
  }, [])

  const fetchRate = useCallback(async () => {
    setLoading(true)
    try {
      // Free exchange rate API
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/EUR')
      const data = await res.json()
      if (data?.rates?.CLP) {
        const rate = 1 / data.rates.CLP // CLP to EUR
        setClpToEur(rate)
        setRateDate(new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }))
        localStorage.setItem(RATE_CACHE_KEY, rate.toString())
        localStorage.setItem(RATE_CACHE_TS_KEY, Date.now().toString())
      }
    } catch {
      console.warn('[Currency] Rate fetch failed, using cached/fallback')
    } finally {
      setLoading(false)
    }
  }, [])

  const eurToClp = 1 / clpToEur
  const rateDisplay = Math.round(eurToClp).toLocaleString('de-DE')

  const handleCLPInput = (val: string) => {
    setInputCLP(val)
    setDirection('clp-to-eur')
    const num = parseFloat(val.replace(/\./g, '').replace(',', '.'))
    if (!isNaN(num)) {
      setInputEUR((num * clpToEur).toFixed(2))
    } else {
      setInputEUR('')
    }
  }

  const handleEURInput = (val: string) => {
    setInputEUR(val)
    setDirection('eur-to-clp')
    const num = parseFloat(val.replace(',', '.'))
    if (!isNaN(num)) {
      setInputCLP(Math.round(num * eurToClp).toLocaleString('de-DE'))
    } else {
      setInputCLP('')
    }
  }

  const formatCLP = (amount: number) => Math.round(amount).toLocaleString('de-DE')
  const formatEUR = (amount: number) => amount.toFixed(2).replace('.', ',')

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
          <h1 className="font-bold text-lg">💱 Währungsrechner</h1>
          <p className="text-xs text-chile-text-muted">
            1 EUR = {rateDisplay} CLP
            {loading && ' ⏳'}
          </p>
        </div>
        <button
          onClick={fetchRate}
          disabled={loading}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          title="Kurs aktualisieren"
        >
          🔄
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        
        {/* Main Converter */}
        <section className="p-4 rounded-xl bg-white/5 border border-white/5">
          {/* CLP Input */}
          <div className="mb-3">
            <label className="text-xs text-chile-text-muted mb-1 block">Chilenische Pesos (CLP)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🇨🇱</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={inputCLP}
                onChange={(e) => handleCLPInput(e.target.value)}
                className={`w-full pl-10 pr-14 py-3 rounded-lg bg-chile-bg-secondary border text-lg font-medium focus:outline-none transition-all ${
                  direction === 'clp-to-eur' ? 'border-chile-accent-teal/50' : 'border-white/10'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-chile-text-muted">CLP</span>
            </div>
          </div>

          {/* Swap button */}
          <div className="flex justify-center my-2">
            <button
              onClick={() => {
                if (direction === 'clp-to-eur') {
                  setDirection('eur-to-clp')
                  if (inputEUR) handleEURInput(inputEUR)
                } else {
                  setDirection('clp-to-eur')
                  if (inputCLP) handleCLPInput(inputCLP)
                }
              }}
              className="w-10 h-10 rounded-full bg-chile-accent-teal/20 flex items-center justify-center hover:bg-chile-accent-teal/30 transition-all text-lg"
            >
              ⇅
            </button>
          </div>

          {/* EUR Input */}
          <div>
            <label className="text-xs text-chile-text-muted mb-1 block">Euro (EUR)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🇪🇺</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={inputEUR}
                onChange={(e) => handleEURInput(e.target.value)}
                className={`w-full pl-10 pr-14 py-3 rounded-lg bg-chile-bg-secondary border text-lg font-medium focus:outline-none transition-all ${
                  direction === 'eur-to-clp' ? 'border-chile-accent-teal/50' : 'border-white/10'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-chile-text-muted">EUR</span>
            </div>
          </div>

          {/* Rate info */}
          <div className="mt-3 text-[10px] text-chile-text-muted text-center">
            Kurs: {rateDate || 'Fallback'} • Datenquelle: exchangerate-api.com
          </div>
        </section>

        {/* Quick Reference CLP → EUR */}
        <section className="p-4 rounded-xl bg-white/5 border border-white/5">
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
            <span>🇨🇱</span> Schnellreferenz CLP → EUR
          </h2>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_AMOUNTS_CLP.map(amount => (
              <button
                key={amount}
                onClick={() => handleCLPInput(amount.toLocaleString('de-DE'))}
                className="flex justify-between items-center px-3 py-2 rounded-lg bg-chile-bg-secondary hover:bg-white/10 transition-colors text-sm"
              >
                <span className="font-medium">{formatCLP(amount)} CLP</span>
                <span className="text-chile-accent-teal">{formatEUR(amount * clpToEur)} €</span>
              </button>
            ))}
          </div>
        </section>

        {/* Quick Reference EUR → CLP */}
        <section className="p-4 rounded-xl bg-white/5 border border-white/5">
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
            <span>🇪🇺</span> Schnellreferenz EUR → CLP
          </h2>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_AMOUNTS_EUR.map(amount => (
              <button
                key={amount}
                onClick={() => handleEURInput(amount.toString())}
                className="flex justify-between items-center px-3 py-2 rounded-lg bg-chile-bg-secondary hover:bg-white/10 transition-colors text-sm"
              >
                <span className="font-medium">{amount} €</span>
                <span className="text-chile-accent-teal">{formatCLP(amount * eurToClp)} CLP</span>
              </button>
            ))}
          </div>
        </section>

        {/* Tipping Guide */}
        <section className="p-4 rounded-xl bg-white/5 border border-white/5">
          <button
            onClick={() => setShowTipping(!showTipping)}
            className="font-bold text-sm w-full flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span>💰</span> Trinkgeld-Guide Chile
            </span>
            <span className="text-chile-text-muted">{showTipping ? '▲' : '▼'}</span>
          </button>
          
          {showTipping && (
            <div className="mt-3 space-y-2">
              {TIPPING_GUIDE.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-chile-bg-secondary">
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.place}</div>
                    <div className="text-xs text-chile-text-muted">{item.tip}</div>
                  </div>
                </div>
              ))}
              <div className="text-[10px] text-chile-text-muted mt-2 px-1">
                In Chile ist Trinkgeld üblich, aber nicht verpflichtend. In Restaurants ist es oft als "propina" auf der Rechnung vorgeschlagen (10%).
              </div>
            </div>
          )}
        </section>

        {/* Useful Price References */}
        <section className="p-4 rounded-xl bg-white/5 border border-white/5">
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
            <span>📋</span> Typische Preise Chile
          </h2>
          <div className="space-y-1.5 text-sm">
            {[
              { item: 'Kaffee (Café)', clp: 2500 },
              { item: 'Bier (Bar)', clp: 3500 },
              { item: 'Empanada', clp: 2000 },
              { item: 'Completo (Hot Dog)', clp: 2500 },
              { item: 'Mittagessen (einfach)', clp: 7000 },
              { item: 'Abendessen (Restaurant)', clp: 15000 },
              { item: 'Wein (Flasche, Supermarkt)', clp: 5000 },
              { item: 'Benzin (1L)', clp: 1200 },
              { item: 'Maut (Autobahn, ~100km)', clp: 3500 },
              { item: 'SIM-Karte (prepaid)', clp: 5000 },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center px-2 py-1.5 rounded bg-chile-bg-secondary/50">
                <span className="text-chile-text-secondary">{item.item}</span>
                <div className="text-right">
                  <span className="font-medium">{formatCLP(item.clp)} CLP</span>
                  <span className="text-chile-text-muted text-xs ml-2">(~{formatEUR(item.clp * clpToEur)} €)</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="text-xs text-chile-text-muted text-center pb-4">
          Preise sind Richtwerte und können variieren
        </div>
      </div>
    </div>
  )
}
