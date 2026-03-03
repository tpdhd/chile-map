// Inline icon components (no external dependency)
const Icon = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>
)
const X_Icon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
)
const MapPinIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
)
const ExternalLinkIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
)

interface SimCardGuideProps {
  onClose: () => void
}

interface EntelShop {
  id: string
  name: string
  address: string
  googleMapsUrl: string
  hours: string
  distance?: string
  tips: string[]
}

const entelShops: EntelShop[] = [
  {
    id: 'entel-centro',
    name: 'Entel Centro',
    address: 'Huérfanos 1160, Santiago Centro',
    googleMapsUrl: 'https://maps.google.com/?q=-33.4372,-70.6484',
    hours: 'Mo-Fr 9:00-19:00, Sa 10:00-14:00',
    distance: '15-20 Min vom Flughafen (Uber)',
    tips: [
      'Nächster zum Stadtzentrum',
      'Kann etwas voll sein vormittags',
      'Reisepass mitbringen!'
    ]
  },
  {
    id: 'entel-costanera',
    name: 'Entel Costanera Center',
    address: 'Av. Andrés Bello 2425, Providencia (Costanera Center Mall)',
    googleMapsUrl: 'https://maps.google.com/?q=-33.4178,-70.6063',
    hours: 'Mo-So 10:00-21:00',
    distance: '25 Min vom Flughafen (Uber)',
    tips: [
      'Im größten Mall Südamerikas',
      'Entspannter, klimatisiert',
      'Auch sonntags geöffnet!',
      'Food Court im 4. Stock'
    ]
  }
]

const priceOptions = [
  {
    plan: 'Plan Fácil 40GB',
    price: '8.000 CLP (~8€)',
    data: '40GB',
    calls: '600 Min',
    validity: '30 Tage',
    recommended: true
  },
  {
    plan: 'Bolsa 20GB',
    price: '8.000 CLP (~8€)',
    data: '20GB',
    calls: '400 Min',
    validity: '30 Tage',
    recommended: false
  },
  {
    plan: 'Bolsa 10GB',
    price: '5.000 CLP (~5€)',
    data: '10GB',
    calls: '300 Min',
    validity: '30 Tage',
    recommended: false
  }
]

export default function SimCardGuide({ onClose }: SimCardGuideProps) {
  return (
    <div className="fixed inset-0 z-[600] bg-chile-bg-primary overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            📱
            <div>
              <h1 className="text-xl font-bold">SIM-Karten Guide</h1>
              <p className="text-sm text-white/80">Entel in Santiago</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X_Icon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
        {/* Quick Action Alert */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-start gap-3">
            ⚠️
            <div>
              <h3 className="font-bold text-lg mb-1">🛫 Am Flughafen?</h3>
              <p className="text-sm mb-2">Die nächsten Entel-Shops sind im Stadtzentrum (~20 Min Uber)</p>
              <a
                href="https://www.uber.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors"
              >
                Uber nach Santiago →
              </a>
            </div>
          </div>
        </div>

        {/* Step by Step Guide */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-chile-text-primary mb-4 flex items-center gap-2">
            ✅
            Schritt-für-Schritt
          </h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="font-semibold text-chile-text-primary">Fahre zum Entel-Shop</h3>
                <p className="text-chile-text-muted text-sm">Nimm Uber/Taxi. Entel Centro (näher) oder Costanera (Mall, entspannter)</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="font-semibold text-chile-text-primary">Sage: "Quiero Plan Fácil 40GB prepago"</h3>
                <p className="text-chile-text-muted text-sm">Das Personal hilft dir. Zeig einfach auf "Plan Fácil 40GB" unten.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="font-semibold text-chile-text-primary">Reisepass zeigen</h3>
                <p className="text-chile-text-muted text-sm">Zwingend nötig für Registrierung. Keine RUT nötig!</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <div>
                <h3 className="font-semibold text-chile-text-primary">Bezahle 8.000 CLP (~8€)</h3>
                <p className="text-chile-text-muted text-sm">Bar oder Karte (beides geht). Personal aktiviert die SIM direkt.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">✓</div>
              <div>
                <h3 className="font-semibold text-green-400">Fertig!</h3>
                <p className="text-chile-text-muted text-sm">SIM einlegen, Handy neu starten. Internet sollte sofort funktionieren.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Price Options */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-chile-text-primary mb-4 flex items-center gap-2">
            💳
            Preise & Pakete
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {priceOptions.map((option) => (
              <div
                key={option.plan}
                className={`p-4 rounded-lg border-2 ${
                  option.recommended
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                {option.recommended && (
                  <div className="text-xs font-bold text-green-400 mb-2">✓ EMPFOHLEN</div>
                )}
                <div className="text-xl font-bold text-chile-text-primary mb-2">{option.plan}</div>
                <div className="text-2xl font-bold text-purple-400 mb-3">{option.price}</div>
                <div className="space-y-1 text-sm text-chile-text-muted">
                  <div>📊 {option.data}</div>
                  <div>📞 {option.calls}</div>
                  <div>📅 {option.validity}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            ℹ️
            <span className="text-sm text-chile-text-muted">
              <strong className="text-blue-400">Warum Entel?</strong> Bestes Netz für ländliche Gebiete und Chiloé. 
              Movistar ist 3€ günstiger, aber schlechterer Empfang außerhalb der Städte.
            </span>
          </div>
        </div>

        {/* Shops with Google Maps Links */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-chile-text-primary mb-4 flex items-center gap-2">
            📍
            Entel-Shops in Santiago
          </h2>

          <div className="space-y-4">
            {entelShops.map((shop) => (
              <div
                key={shop.id}
                className="p-5 rounded-lg border border-white/10 bg-white/5 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-chile-text-primary text-lg mb-1 flex items-center gap-2">
                      📱 {shop.name}
                    </h3>
                    <p className="text-sm text-chile-text-muted mb-1">{shop.address}</p>
                    <p className="text-xs text-chile-text-muted mb-1">🕐 {shop.hours}</p>
                    {shop.distance && (
                      <p className="text-xs text-purple-400">🚗 {shop.distance}</p>
                    )}
                  </div>
                </div>

                <a
                  href={shop.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-colors mb-3"
                >
                  <MapPinIcon className="w-4 h-4" />
                  In Google Maps öffnen
                  <ExternalLinkIcon className="w-4 h-4" />
                </a>

                <div className="mt-3 pt-3 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-chile-text-primary mb-2">💡 Tipps:</h4>
                  <ul className="space-y-1">
                    {shop.tips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-chile-text-muted flex items-start gap-2">
                        <span className="text-green-400 flex-shrink-0">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What to Bring */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-chile-text-primary mb-4">
            ✅ Was mitbringen?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-xl">🛂</div>
              <div>
                <div className="font-semibold text-chile-text-primary">Reisepass</div>
                <div className="text-xs text-chile-text-muted">Zwingend für Registrierung</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-xl">📱</div>
              <div>
                <div className="font-semibold text-chile-text-primary">Entsperrtes Handy</div>
                <div className="text-xs text-chile-text-muted">SIM-Lock-frei</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-xl">💵</div>
              <div>
                <div className="font-semibold text-chile-text-primary">8.000 CLP Bargeld</div>
                <div className="text-xs text-chile-text-muted">Oder Kreditkarte</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-xl">⏱️</div>
              <div>
                <div className="font-semibold text-chile-text-primary">10-15 Minuten Zeit</div>
                <div className="text-xs text-chile-text-muted">Für den ganzen Prozess</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gringo Tips */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-chile-text-primary mb-4">
            🎯 Gringo-Tipps
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏪</span>
              <div>
                <strong className="text-chile-text-primary">Nur offizielle Shops!</strong>
                <p className="text-sm text-chile-text-muted">Keine SIM von Straßenverkäufern kaufen. Nur Entel-Shops.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🗣️</span>
              <div>
                <strong className="text-chile-text-primary">Kein Spanisch nötig</strong>
                <p className="text-sm text-chile-text-muted">"Plan Fácil 40GB prepago" reicht. Personal hilft gerne.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <strong className="text-chile-text-primary">Aktivierung sofort</strong>
                <p className="text-sm text-chile-text-muted">Personal macht das im Shop. Internet funktioniert in 2-3 Minuten.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">📶</span>
              <div>
                <strong className="text-chile-text-primary">Bestes Netz fürs Land</strong>
                <p className="text-sm text-chile-text-muted">Entel hat beste Coverage auf dem Land, in Bergen, auf Chiloé.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
