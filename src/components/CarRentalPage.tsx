import { useState } from 'react'
import carRentalData from '../data/car-rental-data.json'

interface CarRentalPageProps {
  onClose: () => void
}

export default function CarRentalPage({ onClose }: CarRentalPageProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const sections = [
    { id: 'recommendation', icon: '🎯', label: 'Empfehlung' },
    { id: 'companies', icon: '🏢', label: 'Anbieter' },
    { id: 'routes', icon: '📍', label: 'One-Way Routen' },
    { id: 'prices', icon: '💵', label: 'Preise' },
    { id: 'documents', icon: '📋', label: 'Dokumente' },
    { id: 'rules', icon: '⚖️', label: 'Verkehrsregeln' },
    { id: 'fuel', icon: '⛽', label: 'Tanken & Maut' },
    { id: 'tips', icon: '🏆', label: 'Pro Tipps' },
    { id: 'booking', icon: '🔍', label: 'Buchung' },
    { id: 'relocation', icon: '🎁', label: 'Gratis Deals' },
  ]

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
          <h1 className="font-bold text-lg">🚗 Mietwagen Guide</h1>
          <p className="text-xs text-chile-text-muted truncate">Santiago SCL → Puerto Montt PMO</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Card */}
        <div className="mx-4 mt-4 p-4 rounded-xl bg-gradient-to-br from-chile-accent-red/20 to-chile-accent-teal/10 border border-chile-accent-red/30">
          <div className="text-sm font-bold text-chile-accent-red mb-1">⭐ Unsere Route</div>
          <div className="text-lg font-bold mb-1">Santiago SCL → Ruta 5 Süd → Puerto Montt PMO</div>
          <div className="text-sm text-chile-text-secondary mb-2">1.020 km • 11–12 Std Fahrzeit • Exzellente Straße</div>
          <div className="text-xs text-chile-text-muted">
            💡 Auto in Santiago abholen, in Puerto Montt abgeben, mit JetSmart zurückfliegen (~$40 USD)
          </div>
        </div>

        {/* Section Navigation */}
        <div className="flex gap-1.5 overflow-x-auto px-4 py-3 scrollbar-hide">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap flex items-center gap-1 transition-all ${
                activeSection === s.id ? 'bg-chile-accent-red text-white' : 'bg-white/10'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <div className="px-4 pb-6 space-y-4">
          {/* Recommendation Section */}
          {(!activeSection || activeSection === 'recommendation') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>🎯</span> Empfehlung
              </h2>
              <div className="p-3 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 text-sm space-y-2">
                <div className="font-bold text-amber-400">Die optimale Strategie</div>
                <ol className="list-decimal list-inside space-y-1 text-chile-text-secondary">
                  <li>Auf <a href="https://www.transfercar.cl" target="_blank" rel="noopener noreferrer" className="text-chile-accent-teal underline">Transfercar.cl</a> kostenlose Deals prüfen</li>
                  <li>Vergleiche auf <a href="https://www.discovercars.com/chile" target="_blank" rel="noopener noreferrer" className="text-chile-accent-teal underline">DiscoverCars</a> + KAYAK</li>
                  <li>Direktangebot von <a href="https://www.lys.cl" target="_blank" rel="noopener noreferrer" className="text-chile-accent-teal underline">LYS</a> (bester Broker) einholen</li>
                  <li>Compact/Schaltung ab Santiago SCL buchen</li>
                  <li>Abgabe am Flughafen Puerto Montt PMO</li>
                  <li>Rückflug PMO → SCL mit JetSmart/SKY (~$40 USD)</li>
                </ol>
                <div className="font-bold text-amber-400 mt-2">
                  💰 Budget: ~$800–1.000 USD total für 10 Tage Roadtrip
                </div>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-chile-accent-teal/10 border-l-4 border-chile-accent-teal text-sm">
                <div className="font-bold text-chile-accent-teal mb-1">💡 Kompaktwagen reicht!</div>
                <div className="text-chile-text-secondary">
                  Ruta 5 ist eine moderne 4-spurige Autobahn. Kein SUV oder 4x4 nötig. 
                  Spare $15–30/Tag mit einem Compact. SUV nur nötig für Carretera Austral.
                </div>
              </div>
            </section>
          )}

          {/* Companies */}
          {(!activeSection || activeSection === 'companies') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>🏢</span> Mietwagen-Anbieter
              </h2>
              <div className="space-y-2">
                {carRentalData.rentalCompanies
                  .sort((a, b) => b.rating - a.rating)
                  .map((company) => (
                  <div key={company.name} className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{company.name}</span>
                          {company.rating >= 9 && <span className="text-xs">⭐</span>}
                        </div>
                        <div className="text-xs text-chile-text-muted mt-0.5">
                          {company.type === 'international' ? '🌍 International' : company.type === 'local-broker' ? '🤝 Broker' : '🇨🇱 Lokal'}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        company.rating >= 8.5 ? 'bg-chile-accent-teal text-white' : 
                        company.rating >= 7 ? 'bg-amber-500/80 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {company.rating}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {company.features.map(f => (
                        <span key={f} className="px-2 py-0.5 bg-chile-accent-teal/15 text-chile-accent-teal rounded text-[10px]">{f}</span>
                      ))}
                      {company.allowsOneWay && (
                        <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded text-[10px]">One-Way ✓</span>
                      )}
                    </div>
                    {company.oneWayFeeNote && (
                      <div className="text-xs text-chile-text-muted mt-1.5">
                        📍 {company.oneWayFeeNote}
                      </div>
                    )}
                    <a href={company.website} target="_blank" rel="noopener noreferrer" 
                       className="text-xs text-chile-accent-teal mt-1.5 inline-block">
                      {company.website.replace('https://', '').replace('www.', '').split('/')[0]} →
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* One-Way Routes */}
          {(!activeSection || activeSection === 'routes') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>📍</span> One-Way Routen & Drop-Off Gebühren
              </h2>
              <div className="p-3 rounded-xl bg-red-500/10 border-l-4 border-red-500 text-sm mb-3">
                <div className="font-bold text-red-400">⚠️ One-Way Gebühren sind teuer</div>
                <div className="text-chile-text-secondary text-xs mt-1">
                  Standard: ~$0.45/km. Alle Anbieter berechnen ähnliche Preise.
                </div>
              </div>
              <div className="space-y-2">
                {carRentalData.oneWayRoutes.map((route, idx) => {
                  const isRecommended = route.to.includes('Puerto Montt')
                  return (
                    <div key={idx} className={`p-3 rounded-xl border text-sm ${
                      isRecommended ? 'bg-chile-accent-red/10 border-chile-accent-red/30' : 'bg-white/5 border-white/5'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-xs">
                          {route.from} → {route.to} {isRecommended && '⭐'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-chile-text-secondary">
                        <div>📏 {route.distance}</div>
                        <div>⏱️ {route.driveTime}</div>
                        <div className="text-amber-400 font-medium">💰 Drop-Off: {route.estimatedDropOffFee}</div>
                        <div>⛽ Fuel: {route.fuelCost}</div>
                        <div>🏗️ Maut: {route.tollCosts}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 text-sm">
                <div className="font-bold text-amber-400">💰 Kostenbeispiel: 10 Tage Santiago → Puerto Montt</div>
                <div className="text-xs text-chile-text-secondary mt-1">
                  Compact $30/Tag × 10 = $300 + $400 Drop-Off + $50 Maut + $90 Benzin = <strong className="text-white">~$840 USD total</strong>
                </div>
              </div>
            </section>
          )}

          {/* Prices */}
          {(!activeSection || activeSection === 'prices') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>💵</span> Tagespreise (Feb/Mar 2026)
              </h2>
              <div className="space-y-2">
                {carRentalData.dailyRates.categories.map(cat => (
                  <div key={cat.category} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{cat.category}</div>
                      <div className="text-xs text-chile-text-muted">{cat.examples}</div>
                      <div className="text-[10px] text-chile-text-muted mt-0.5">{cat.transmission}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 font-bold text-lg">
                        ${cat.dailyRate.low}–{cat.dailyRate.high}
                      </div>
                      <div className="text-[10px] text-chile-text-muted">/Tag USD</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-chile-text-muted mt-2">
                ⚠️ Automatik deutlich teurer als Schaltung. Früh buchen!
              </div>
            </section>
          )}

          {/* Documents */}
          {(!activeSection || activeSection === 'documents') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>📋</span> Benötigte Dokumente
              </h2>
              <div className="p-3 rounded-xl bg-red-500/10 border-l-4 border-red-500 text-sm mb-3">
                <div className="font-bold text-red-400 mb-1">Pflichtdokumente</div>
                <ul className="space-y-1 text-xs text-chile-text-secondary">
                  {carRentalData.documents.required.map((doc, i) => (
                    <li key={i} className="flex gap-1.5"><span className="text-red-400 flex-shrink-0">→</span> {doc}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-xl bg-chile-accent-teal/10 border-l-4 border-chile-accent-teal text-sm mb-3">
                <div className="font-bold text-chile-accent-teal mb-1">Empfohlen</div>
                <ul className="space-y-1 text-xs text-chile-text-secondary">
                  {carRentalData.documents.recommended.map((doc, i) => (
                    <li key={i} className="flex gap-1.5"><span className="text-chile-accent-teal flex-shrink-0">→</span> {doc}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border-l-4 border-blue-500 text-sm">
                <div className="font-bold text-blue-400 mb-1">🇩🇪 Deutsche Führerscheine</div>
                <div className="text-xs text-chile-text-secondary">
                  EU-Führerschein wird in Chile bis zu 90 Tage akzeptiert. Internationaler Führerschein empfohlen aber nicht pflicht.
                  Kreditkarte muss ausreichendes Limit für Kaution haben (CLP 500.000–2.000.000).
                </div>
              </div>
            </section>
          )}

          {/* Driving Rules */}
          {(!activeSection || activeSection === 'rules') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>⚖️</span> Verkehrsregeln Chile
              </h2>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2.5 rounded-xl bg-white/5 text-center">
                  <div className="text-xl font-bold text-chile-accent-red">120</div>
                  <div className="text-[10px] text-chile-text-muted">km/h Autobahn</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 text-center">
                  <div className="text-xl font-bold text-chile-accent-red">50-60</div>
                  <div className="text-[10px] text-chile-text-muted">km/h Stadt</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 text-center">
                  <div className="text-xl font-bold text-chile-accent-red">0.3 g/L</div>
                  <div className="text-[10px] text-chile-text-muted">Promillegrenze</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 text-center">
                  <div className="text-xl font-bold text-chile-accent-teal">RECHTS</div>
                  <div className="text-[10px] text-chile-text-muted">Fahrtrichtung</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-chile-text-secondary">
                <div className="flex gap-1.5"><span>💡</span> Licht IMMER an – auch tagsüber</div>
                <div className="flex gap-1.5"><span>🚫</span> Kein Rechtsabbiegen bei Rot</div>
                <div className="flex gap-1.5"><span>📱</span> Handy nur mit Freisprechanlage</div>
                <div className="flex gap-1.5"><span>🚭</span> Rauchen am Steuer verboten</div>
                <div className="flex gap-1.5"><span>🍺</span> Null-Toleranz empfohlen (0.3 g/L ≈ 1 kleines Bier)</div>
                <div className="flex gap-1.5"><span>👮</span> Carabineros sind ehrlich – niemals Geld anbieten</div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-red-500/10 text-center">
                  <div className="text-lg font-bold">133</div>
                  <div className="text-[10px] text-chile-text-muted">Polizei</div>
                </div>
                <div className="p-2 rounded-xl bg-red-500/10 text-center">
                  <div className="text-lg font-bold">131</div>
                  <div className="text-[10px] text-chile-text-muted">Ambulanz</div>
                </div>
                <div className="p-2 rounded-xl bg-red-500/10 text-center">
                  <div className="text-lg font-bold">132</div>
                  <div className="text-[10px] text-chile-text-muted">Feuerwehr</div>
                </div>
              </div>
            </section>
          )}

          {/* Fuel & Tolls */}
          {(!activeSection || activeSection === 'fuel') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>⛽</span> Tanken & Maut
              </h2>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2.5 rounded-xl bg-white/5 text-center">
                  <div className="text-lg font-bold text-amber-400">€{carRentalData.fuelInfo.pricePerLiter.EUR}</div>
                  <div className="text-[10px] text-chile-text-muted">Bencina 95/L</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 text-center">
                  <div className="text-lg font-bold text-amber-400">€{carRentalData.fuelInfo.dieselPricePerLiter.EUR}</div>
                  <div className="text-[10px] text-chile-text-muted">Diesel/L</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-chile-text-secondary mb-3">
                {carRentalData.fuelInfo.tips.map((tip, i) => (
                  <div key={i} className="flex gap-1.5"><span className="text-chile-accent-teal">→</span> {tip}</div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                <div className="font-bold text-sm mb-1">🏗️ Maut Santiago → Puerto Montt</div>
                <div className="text-xs text-chile-text-secondary">
                  <div>• Santiago: TAG elektronisch (im Mietwagen inkl.)</div>
                  <div>• Ruta 5: Manuelle Mautstellen, Bar/Karte</div>
                  <div>• Gesamt: <span className="text-amber-400 font-medium">CLP 40.000–60.000 (~$40–60 USD)</span></div>
                  <div className="mt-1 text-chile-text-muted">💡 CLP 60.000–80.000 Bargeld für Maut mitnehmen!</div>
                </div>
              </div>
            </section>
          )}

          {/* Pro Tips */}
          {(!activeSection || activeSection === 'tips') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>🏆</span> Pro Tipps
              </h2>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                  <div className="font-bold text-xs mb-1.5">🗓️ Planung</div>
                  <div className="space-y-1 text-xs text-chile-text-secondary">
                    <div>→ Früh buchen für Feb/Mar (Hochsaison)</div>
                    <div>→ Transfercar für kostenlose Deals checken</div>
                    <div>→ 3+ Plattformen vergleichen</div>
                    <div>→ Nord→Süd fahren = bessere Preise & Versicherung</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                  <div className="font-bold text-xs mb-1.5">🚗 Unterwegs</div>
                  <div className="space-y-1 text-xs text-chile-text-secondary">
                    <div>→ Tank nie unter halbe Füllung kommen lassen</div>
                    <div>→ Copec "Pronto" = bester Freund (Kaffee, Essen, WC)</div>
                    <div>→ Chilenische Pesos bar mitnehmen</div>
                    <div>→ Offline Maps herunterladen</div>
                    <div>→ Nicht nachts in ländlichen Gebieten fahren</div>
                    <div>→ Fahrzeug bei Abholung genau dokumentieren (Fotos!)</div>
                    <div>→ Alle Dokumente im Auto behalten</div>
                    <div>→ "Cuidadores" passen auf Autos auf (CLP 500–1.000 Trinkgeld)</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                  <div className="font-bold text-xs mb-1.5">🛡️ Versicherung</div>
                  <div className="space-y-1 text-xs text-chile-text-secondary">
                    <div>→ CDW (Vollkasko mit SB) ist immer inklusive</div>
                    <div>→ SB Economy: CLP 500.000 (~€490)</div>
                    <div>→ SB SUV: CLP 900.000 (~€880)</div>
                    <div>→ Vollkasko ohne SB: +$10–20/Tag extra</div>
                    <div>→ In Santiago starten = günstigere Versicherung</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Booking Platforms */}
          {(!activeSection || activeSection === 'booking') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>🔍</span> Buchungsplattformen
              </h2>
              <div className="space-y-1.5">
                {carRentalData.bookingPlatforms.map(platform => (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-chile-accent-teal/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{platform.name}</div>
                      <div className="text-[10px] text-chile-text-muted">{platform.note}</div>
                    </div>
                    <span className="text-chile-accent-teal text-xs">→</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Relocation Deals */}
          {(!activeSection || activeSection === 'relocation') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>🎁</span> Kostenlose Relocation Deals
              </h2>
              <div className="p-3 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 text-sm mb-3">
                <div className="font-bold text-amber-400 mb-1">🤑 Gratis fahren mit Transfercar!</div>
                <div className="text-xs text-chile-text-secondary">
                  Hertz, Europcar & Mitta müssen Autos zwischen Städten verschieben. 
                  Du fährst sie für <strong className="text-white">$0/Tag</strong> — 
                  manchmal mit Benzin und TAG inklusive!
                </div>
              </div>
              <a 
                href="https://www.transfercar.cl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 rounded-xl bg-chile-accent-teal/10 border border-chile-accent-teal/30 text-sm hover:bg-chile-accent-teal/20 transition-colors"
              >
                <div className="font-bold text-chile-accent-teal mb-1">Transfercar Chile</div>
                <div className="text-xs text-chile-text-secondary">
                  2–5 Tage Zeitfenster • Hertz, Europcar, Mitta • 
                  Beste Zeit: nach Sommer (März/April)
                </div>
                <div className="text-chile-accent-teal text-xs mt-1">transfercar.cl →</div>
              </a>
            </section>
          )}

          {/* Road Conditions */}
          <section>
            <h2 className="font-bold text-base mb-3 flex items-center gap-2">
              <span>🛣️</span> Straßenbedingungen
            </h2>
            <div className="p-3 rounded-xl bg-green-500/10 border-l-4 border-green-500 text-sm mb-2">
              <div className="font-bold text-green-400 mb-1">Ruta 5: Santiago → Puerto Montt</div>
              <div className="text-xs text-chile-text-secondary">
                Exzellent! Moderne 4-spurige Autobahn, komplett asphaltiert. 
                Copec-Tankstellen & Raststätten regelmäßig.
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 text-sm">
              <div className="font-bold text-amber-400 mb-1">Carretera Austral: Ab Puerto Montt</div>
              <div className="text-xs text-chile-text-secondary">
                Gemischt: Asphalt + Schotter + Vulkanasche. SUV/Pickup empfohlen. 
                Wenig Tankstellen — vorausplanen!
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
