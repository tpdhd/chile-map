import { useState } from 'react'
import carRentalData from '../data/car-rental-data.json'

interface CarRentalPageProps {
  onClose: () => void
}

export default function CarRentalPage({ onClose }: CarRentalPageProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const sections = [
    { id: 'trip', icon: '✈️', label: 'Unser Trip' },
    { id: 'cost', icon: '💰', label: 'Kosten' },
    { id: 'vehicle', icon: '🚙', label: 'Fahrzeug' },
    { id: 'ripio', icon: '🪨', label: 'Ripio/Gravel' },
    { id: 'companies', icon: '🏢', label: 'Anbieter' },
    { id: 'routes', icon: '📍', label: 'One-Way' },
    { id: 'documents', icon: '📋', label: 'Dokumente' },
    { id: 'insurance', icon: '🛡️', label: 'Versicherung' },
    { id: 'fuel', icon: '⛽', label: 'Tanken & Maut' },
    { id: 'rules', icon: '⚖️', label: 'Verkehrsregeln' },
    { id: 'breakdown', icon: '🔧', label: 'Panne' },
    { id: 'booking', icon: '🔍', label: 'Buchung' },
    { id: 'relocation', icon: '🎁', label: 'Gratis Deals' },
    { id: 'tips', icon: '🏆', label: 'Pro Tipps' },
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
          <p className="text-xs text-chile-text-muted truncate">23 Tage • Santiago SCL → Puerto Montt • 3 Erwachsene</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Card — Trip Summary */}
        <div className="mx-4 mt-4 p-4 rounded-xl bg-gradient-to-br from-chile-accent-red/20 to-chile-accent-teal/10 border border-chile-accent-red/30">
          <div className="text-sm font-bold text-chile-accent-red mb-2">✈️ Unser Roadtrip März 2026</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <div className="text-chile-text-muted">📅 Dauer</div>
            <div className="font-medium">3./4. – 26./27. März (~23 Tage)</div>
            <div className="text-chile-text-muted">📍 Abholung</div>
            <div className="font-medium">Santiago SCL Flughafen</div>
            <div className="text-chile-text-muted">📍 Abgabe</div>
            <div className="font-medium">Puerto Montt (PMC)</div>
            <div className="text-chile-text-muted">👥 Personen</div>
            <div className="font-medium">3 Erwachsene</div>
            <div className="text-chile-text-muted">🧳 Gepäck</div>
            <div className="font-medium">3 kleine Koffer + Taschen</div>
            <div className="text-chile-text-muted">⚙️ Getriebe</div>
            <div className="font-medium">Schaltung (alle können)</div>
            <div className="text-chile-text-muted">🪨 Terrain</div>
            <div className="font-medium text-amber-400">Ripio/Schotter! → SUV nötig</div>
            <div className="text-chile-text-muted">🇦🇷 Argentinien</div>
            <div className="font-medium">Nein, nicht geplant</div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 text-xs text-chile-text-muted">
            💡 Rückflug: ~28. März von Puerto Montt (PMC) → Santiago mit JetSmart/SKY (~$30-50/Person)
          </div>
        </div>

        {/* Cost Quick Summary */}
        <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-amber-400 font-bold">💰 Geschätzte Gesamtkosten</div>
              <div className="text-xs text-chile-text-muted mt-0.5">23 Tage • SUV Schaltung • 3 Fahrer</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-amber-400">~$1.875–2.840</div>
              <div className="text-[10px] text-chile-text-muted">USD total • ~$625–945/Person</div>
            </div>
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

          {/* ==================== TRIP DETAILS ==================== */}
          {(!activeSection || activeSection === 'trip') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>✈️</span> Trip Details & Strategie
              </h2>
              <div className="p-3 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 text-sm space-y-2">
                <div className="font-bold text-amber-400">🎯 Die optimale Strategie für unseren Trip</div>
                <ol className="list-decimal list-inside space-y-1.5 text-chile-text-secondary">
                  <li>Auf <a href="https://www.transfercar.cl" target="_blank" rel="noopener noreferrer" className="text-chile-accent-teal underline">Transfercar.cl</a> kostenlose Deals prüfen (März = perfekt!)</li>
                  <li>Vergleiche auf <a href="https://www.discovercars.com/chile" target="_blank" rel="noopener noreferrer" className="text-chile-accent-teal underline">DiscoverCars</a> + <a href="https://www.kayak.com/Chile-Car-Rentals.48.crc.html" target="_blank" rel="noopener noreferrer" className="text-chile-accent-teal underline">KAYAK</a></li>
                  <li>Direktangebot von <a href="https://www.lys.cl" target="_blank" rel="noopener noreferrer" className="text-chile-accent-teal underline">LYS</a> einholen (bester Broker, Ripio-freundlich)</li>
                  <li><strong className="text-white">Midsize SUV mit Schaltung</strong> buchen — Ripio-tauglich!</li>
                  <li>Alle <strong className="text-white">3 Fahrer</strong> bei Buchung anmelden</li>
                  <li>Schriftlich bestätigen lassen: <strong className="text-amber-400">Versicherung deckt Ripio/Schotter</strong></li>
                  <li>Abgabe Flughafen Puerto Montt (PMC)</li>
                  <li>Rückflug PMC → SCL mit JetSmart/SKY (~$30-50/Person)</li>
                </ol>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-chile-accent-teal/10 border-l-4 border-chile-accent-teal text-sm">
                <div className="font-bold text-chile-accent-teal mb-1">🚙 Warum SUV und nicht Compact?</div>
                <div className="text-chile-text-secondary space-y-1">
                  <div>→ Ruta 5 ist super Autobahn, da reicht jedes Auto</div>
                  <div>→ <strong className="text-amber-400">ABER</strong>: Wir fahren Ripio! Nationalparks, Vulkane, Seengebiet = Schotterstraßen</div>
                  <div>→ SUV = Bodenfreiheit + Versicherung deckt Schotter</div>
                  <div>→ Mit Schaltung statt Automatik ~$10-15/Tag günstiger</div>
                  <div>→ 3 Erwachsene + Gepäck brauchen den Platz im Kofferraum</div>
                </div>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border-l-4 border-red-500 text-sm">
                <div className="font-bold text-red-400 mb-1">⚠️ Wichtig: Früh buchen!</div>
                <div className="text-chile-text-secondary">
                  März ist Hochsaison-Ende. Manuelle SUVs sind selten — sie werden zuerst ausgebucht.
                  Am besten <strong className="text-white">9-12 Monate vorher</strong> buchen, also spätestens Mai/Juni 2025.
                </div>
              </div>
            </section>
          )}

          {/* ==================== COST ESTIMATE ==================== */}
          {(!activeSection || activeSection === 'cost') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>💰</span> Kostenaufstellung (23 Tage)
              </h2>

              <div className="space-y-1.5">
                {carRentalData.costEstimate.breakdown.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="text-xs text-chile-text-secondary flex-1 min-w-0 pr-3">{item.item}</div>
                    <div className="text-sm font-bold text-amber-400 whitespace-nowrap">
                      ${item.low}–{item.high}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-amber-400 text-sm">GESAMT (23 Tage, 3 Personen)</div>
                  <div className="text-xl font-bold text-amber-400">${carRentalData.costEstimate.totalLow}–{carRentalData.costEstimate.totalHigh}</div>
                </div>
                <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/10">
                  <div className="text-xs text-chile-text-muted">Pro Person</div>
                  <div className="text-sm font-bold text-chile-accent-teal">${carRentalData.costEstimate.perPersonLow}–{carRentalData.costEstimate.perPersonHigh}</div>
                </div>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-chile-accent-teal/10 border-l-4 border-chile-accent-teal text-sm">
                <div className="font-bold text-chile-accent-teal mb-1">💡 Spartipps</div>
                <div className="text-xs text-chile-text-secondary space-y-1">
                  <div>→ <strong className="text-white">Zusatzfahrer-Gebühr verhandeln</strong>: Bei 23 Tagen Rabatt verlangen!</div>
                  <div>→ <strong className="text-white">Schaltung statt Automatik</strong>: Spart ~$10-15/Tag = $230-345 bei 23 Tagen</div>
                  <div>→ <strong className="text-white">Transfercar.cl prüfen</strong>: März = Umzugszeit, evtl. kostenlose Deals</div>
                  <div>→ <strong className="text-white">LYS direkt anfragen</strong>: Broker-Preis oft besser als Aggregator</div>
                  <div>→ <strong className="text-white">JetSmart Gepäck</strong>: Nur Handgepäck buchen für Rückflug, Koffer separat</div>
                </div>
              </div>
            </section>
          )}

          {/* ==================== VEHICLE ==================== */}
          {(!activeSection || activeSection === 'vehicle') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>🚙</span> Fahrzeugempfehlung
              </h2>

              <div className="p-3 rounded-xl bg-chile-accent-red/10 border-l-4 border-chile-accent-red text-sm mb-3">
                <div className="font-bold text-chile-accent-red mb-1.5">⭐ Empfehlung: Compact/Midsize SUV Schaltung</div>
                <div className="text-chile-text-secondary space-y-1">
                  <div><strong className="text-white">Top-Wahl:</strong> Suzuki Vitara, Hyundai Tucson, Kia Sportage</div>
                  <div><strong className="text-white">Alternative:</strong> MG ZS, Toyota Raize, VW T-Cross</div>
                  <div><strong className="text-white">Getriebe:</strong> Manual — alle können Schaltung, spart $10-15/Tag</div>
                  <div><strong className="text-white">Grund:</strong> Bodenfreiheit für Ripio + Platz für 3 + Gepäck</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2.5 rounded-xl bg-white/5 text-center">
                  <div className="text-lg font-bold text-amber-400">$35–65</div>
                  <div className="text-[10px] text-chile-text-muted">Compact SUV/Tag</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 text-center">
                  <div className="text-lg font-bold text-amber-400">$45–80</div>
                  <div className="text-[10px] text-chile-text-muted">Midsize SUV/Tag</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                  <div className="font-bold text-xs mb-1.5">✅ Was der SUV können muss</div>
                  <div className="space-y-1 text-xs text-chile-text-secondary">
                    <div>→ Bodenfreiheit ≥170mm (wichtig für Ripio/Steine)</div>
                    <div>→ Schaltgetriebe verfügbar</div>
                    <div>→ Kofferraum für 3 kleine Koffer + Taschen</div>
                    <div>→ Versicherung deckt Schotterstraßen ab</div>
                    <div>→ Reserverad + Werkzeug vorhanden</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                  <div className="font-bold text-xs mb-1.5">🧳 Gepäck-Check: Passt alles rein?</div>
                  <div className="space-y-1 text-xs text-chile-text-secondary">
                    <div>→ <strong className="text-white">Tucson/Sportage</strong>: ~620L Kofferraum → locker Platz</div>
                    <div>→ <strong className="text-white">Vitara/Raize</strong>: ~375L → eng mit großem Koffer</div>
                    <div>→ 3 kleine Koffer + Taschen = ~200-250L → passt in alle</div>
                    <div>→ Großer Koffer auf Rückweg? → Tucson/Sportage besser</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 text-sm">
                <div className="font-bold text-amber-400 mb-1">⚠️ Manuelle SUVs sind selten!</div>
                <div className="text-xs text-chile-text-secondary">
                  Die meisten Tucson/Sportage sind Automatik. Vitara und ältere Modelle gibt es eher mit Schaltung.
                  Frühzeitig buchen oder bereit sein, Compact SUV (MG ZS, T-Cross) zu nehmen.
                </div>
              </div>
            </section>
          )}

          {/* ==================== RIPIO / GRAVEL ROADS ==================== */}
          {(!activeSection || activeSection === 'ripio') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>🪨</span> Ripio / Schotterstraßen
              </h2>

              <div className="p-3 rounded-xl bg-red-500/10 border-l-4 border-red-500 text-sm mb-3">
                <div className="font-bold text-red-400 mb-1">⚠️ KRITISCH: Versicherung & Ripio</div>
                <div className="text-xs text-chile-text-secondary space-y-1">
                  <div>Viele Vermieter <strong className="text-red-400">schließen Schotterschäden aus</strong>, wenn:</div>
                  <div>→ Falscher Fahrzeugtyp (Economy/Compact auf Ripio)</div>
                  <div>→ Nicht explizit im Vertrag erlaubt</div>
                  <div>→ <strong className="text-white">IMMER schriftliche Bestätigung verlangen!</strong></div>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="text-xs font-bold text-chile-text-muted uppercase tracking-wide">Anbieter & Ripio-Policy</div>
                {carRentalData.ripioInfo.companiesThatAllowRipio.map((company) => (
                  <div key={company.name} className={`p-2.5 rounded-xl border text-sm ${
                    company.recommended ? 'bg-chile-accent-teal/10 border-chile-accent-teal/30' : 'bg-white/5 border-white/5'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-xs">{company.name} {company.recommended ? '✅' : '⚠️'}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        company.recommended ? 'bg-chile-accent-teal/20 text-chile-accent-teal' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {company.recommended ? 'Empfohlen' : 'Prüfen'}
                      </span>
                    </div>
                    <div className="text-xs text-chile-text-secondary">{company.policy}</div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                <div className="font-bold text-xs mb-1.5">🛞 Tipps für Ripio-Fahren</div>
                <div className="space-y-1 text-xs text-chile-text-secondary">
                  {carRentalData.ripioInfo.tipsForRipio.map((tip, i) => (
                    <div key={i} className="flex gap-1.5"><span className="text-chile-accent-teal flex-shrink-0">→</span> {tip}</div>
                  ))}
                </div>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-chile-accent-teal/10 border-l-4 border-chile-accent-teal text-sm">
                <div className="font-bold text-chile-accent-teal mb-1">📝 Bei Abholung verlangen</div>
                <div className="text-xs text-chile-text-secondary space-y-1">
                  <div>→ Schriftlich: "Vehículo autorizado para caminos de ripio/tierra"</div>
                  <div>→ Reserverad prüfen + Wagenheber + Radschlüssel</div>
                  <div>→ Alle vorhandenen Schäden fotografieren (Video!)</div>
                  <div>→ Reifenprofil kontrollieren</div>
                  <div>→ 24h Pannenhilfe-Nummer notieren</div>
                </div>
              </div>
            </section>
          )}

          {/* ==================== COMPANIES ==================== */}
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
                          {(company as any).allowsRipio && <span className="ml-2 text-chile-accent-teal">🪨 Ripio OK</span>}
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
                        <span key={f} className={`px-2 py-0.5 rounded text-[10px] ${
                          f.includes('Ripio') ? 'bg-amber-500/15 text-amber-400' : 'bg-chile-accent-teal/15 text-chile-accent-teal'
                        }`}>{f}</span>
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
                    {(company as any).ripioNote && (
                      <div className="text-xs text-chile-text-muted mt-1">
                        🪨 {(company as any).ripioNote}
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

          {/* ==================== ONE-WAY ROUTES ==================== */}
          {(!activeSection || activeSection === 'routes') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>📍</span> One-Way Routen & Drop-Off Gebühren
              </h2>
              <div className="p-3 rounded-xl bg-red-500/10 border-l-4 border-red-500 text-sm mb-3">
                <div className="font-bold text-red-400">⚠️ One-Way Gebühren sind teuer</div>
                <div className="text-chile-text-secondary text-xs mt-1">
                  Standard: ~$0.45/km. Alle Anbieter berechnen ähnliche Preise. Unsere Route: $350–450.
                </div>
              </div>
              <div className="space-y-2">
                {carRentalData.oneWayRoutes.map((route, idx) => {
                  const isOurRoute = route.to.includes('Puerto Montt')
                  return (
                    <div key={idx} className={`p-3 rounded-xl border text-sm ${
                      isOurRoute ? 'bg-chile-accent-red/10 border-chile-accent-red/30' : 'bg-white/5 border-white/5'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-xs">
                          {route.from} → {route.to} {isOurRoute && '⭐ Unsere Route'}
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
                <div className="font-bold text-amber-400">💰 Unsere Route: Santiago → Puerto Montt</div>
                <div className="text-xs text-chile-text-secondary mt-1">
                  SUV $45/Tag × 23 = $1.035 + $400 Drop-Off + $60 Maut + $130 Benzin + $290 Versicherung + $300 Zusatzfahrer = <strong className="text-white">~$2.215 USD</strong>
                </div>
              </div>
            </section>
          )}

          {/* ==================== DOCUMENTS ==================== */}
          {(!activeSection || activeSection === 'documents') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>📋</span> Benötigte Dokumente
              </h2>
              <div className="p-3 rounded-xl bg-red-500/10 border-l-4 border-red-500 text-sm mb-3">
                <div className="font-bold text-red-400 mb-1">Pflichtdokumente (für ALLE 3 Fahrer)</div>
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

              {/* Additional Drivers Section */}
              <div className="p-3 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 text-sm mb-3">
                <div className="font-bold text-amber-400 mb-1">👥 3 Fahrer — Zusatzfahrer-Regelung</div>
                <ul className="space-y-1.5 text-xs text-chile-text-secondary">
                  {carRentalData.documents.additionalDrivers.map((item, i) => (
                    <li key={i} className="flex gap-1.5"><span className="text-amber-400 flex-shrink-0">→</span> {item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border-l-4 border-blue-500 text-sm">
                <div className="font-bold text-blue-400 mb-1">🇩🇪 Deutsche Führerscheine</div>
                <div className="text-xs text-chile-text-secondary">
                  EU-Führerschein wird in Chile bis zu 90 Tage akzeptiert. Internationaler Führerschein empfohlen aber nicht pflicht.
                  Kreditkarte muss ausreichendes Limit für Kaution haben (CLP 500.000–2.000.000, also €490–€1.960).
                </div>
              </div>
            </section>
          )}

          {/* ==================== INSURANCE ==================== */}
          {(!activeSection || activeSection === 'insurance') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>🛡️</span> Versicherung & Ripio
              </h2>

              <div className="p-3 rounded-xl bg-red-500/10 border-l-4 border-red-500 text-sm mb-3">
                <div className="font-bold text-red-400 mb-1">⚠️ WICHTIGSTER PUNKT: Ripio-Abdeckung!</div>
                <div className="text-xs text-chile-text-secondary space-y-1">
                  <div>Standard-CDW deckt Schotterstraßen oft <strong className="text-red-400">NICHT</strong> ab, wenn:</div>
                  <div>→ Fahrzeug nicht als SUV/4x4 kategorisiert ist</div>
                  <div>→ Vertrag keine ausdrückliche Genehmigung für unbefestigte Straßen enthält</div>
                  <div>→ Reifen- und Unterbodenschäden sind häufig ausgeschlossen</div>
                  <div className="pt-1"><strong className="text-white">✅ Lösung: Full CDW + schriftliche Ripio-Genehmigung</strong></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                  <div className="font-bold text-xs mb-1.5">Basis (immer inkl.): CDW</div>
                  <div className="text-xs text-chile-text-secondary space-y-1">
                    <div>→ Kollisionsschutz mit Selbstbeteiligung</div>
                    <div>→ Diebstahlschutz mit Selbstbeteiligung</div>
                    <div>→ Haftpflicht gegenüber Dritten</div>
                    <div className="text-amber-400">→ SB Economy: ~$525 | SB Midsize: ~$735 | SB SUV: ~$945</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-chile-accent-teal/10 border border-chile-accent-teal/30 text-sm">
                  <div className="font-bold text-xs mb-1.5 text-chile-accent-teal">✅ Empfohlen: Full CDW (Zero Deductible)</div>
                  <div className="text-xs text-chile-text-secondary space-y-1">
                    <div>→ Keine Selbstbeteiligung bei Schäden</div>
                    <div>→ ~$10-15/Tag extra × 23 Tage = $230-345</div>
                    <div>→ <strong className="text-white">Lohnt sich bei Ripio!</strong> Ein Steinschlag = $945 SB ohne Full CDW</div>
                    <div>→ Fragen: Deckt Full CDW auch Reifen + Windschutzscheibe + Unterboden?</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                  <div className="font-bold text-xs mb-1.5">📋 Checkliste bei Buchung</div>
                  <div className="text-xs text-chile-text-secondary space-y-1">
                    <div>→ "¿El seguro cubre caminos de ripio?" (Deckt die Versicherung Schotter?)</div>
                    <div>→ "¿Hay cobertura para neumáticos y parabrisas?" (Reifen + Windschutzscheibe?)</div>
                    <div>→ "¿Cuál es el deducible con cobertura total?" (Selbstbeteiligung bei Full CDW?)</div>
                    <div>→ Antworten <strong className="text-white">schriftlich per E-Mail</strong> bestätigen lassen!</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ==================== FUEL & TOLLS ==================== */}
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

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm mb-3">
                <div className="font-bold text-xs mb-1.5">⛽ Tankstellen auf unserer Route</div>
                <div className="space-y-1 text-xs text-chile-text-secondary">
                  <div>→ <strong className="text-white">Ruta 5</strong>: Copec alle 50-80km — kein Problem</div>
                  <div>→ <strong className="text-white">Seengebiet</strong>: In allen Städten (Pucón, Villarrica, Osorno, etc.)</div>
                  <div>→ <strong className="text-amber-400">Nationalpark-Straßen</strong>: KEINE Tankstellen! Vorher volltanken!</div>
                  <div>→ <strong className="text-white">SUV-Verbrauch</strong>: ~9-11L/100km statt ~7L/100km bei Compact</div>
                  <div>→ Auf Ripio: Mehr Verbrauch durch niedrige Geschwindigkeit + hohes Drehmoment</div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-chile-text-secondary mb-3">
                {carRentalData.fuelInfo.tips.map((tip, i) => (
                  <div key={i} className="flex gap-1.5"><span className="text-chile-accent-teal">→</span> {tip}</div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                <div className="font-bold text-sm mb-1">🏗️ Maut: $50-80 USD gesamt</div>
                <div className="text-xs text-chile-text-secondary">
                  <div>• <strong className="text-white">Santiago</strong>: TAG elektronisch (im Mietwagen inkl.)</div>
                  <div>• <strong className="text-white">Ruta 5</strong>: Manuelle Mautstellen, Bar/Karte</div>
                  <div>• Gesamt: <span className="text-amber-400 font-medium">CLP 40.000–60.000 (~$40–60 USD)</span></div>
                  <div>• Santiago Stadtautobahnen extra: ~$10-20</div>
                  <div className="mt-1 text-chile-text-muted">💡 CLP 80.000 Bargeld für Maut mitnehmen!</div>
                </div>
              </div>
            </section>
          )}

          {/* ==================== DRIVING RULES ==================== */}
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
                  <div className="text-xl font-bold text-amber-400">40-60</div>
                  <div className="text-[10px] text-chile-text-muted">km/h auf Ripio</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-chile-text-secondary">
                <div className="flex gap-1.5"><span>💡</span> Licht IMMER an – auch tagsüber</div>
                <div className="flex gap-1.5"><span>🚫</span> Kein Rechtsabbiegen bei Rot</div>
                <div className="flex gap-1.5"><span>📱</span> Handy nur mit Freisprechanlage</div>
                <div className="flex gap-1.5"><span>🚭</span> Rauchen am Steuer verboten</div>
                <div className="flex gap-1.5"><span>🍺</span> Null-Toleranz empfohlen (0.3 g/L ≈ 1 kleines Bier)</div>
                <div className="flex gap-1.5"><span>👮</span> Carabineros sind ehrlich – niemals Geld anbieten</div>
                <div className="flex gap-1.5"><span>🚗</span> Auf Ripio: RECHTS fahren, langsam, Abstand halten</div>
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

          {/* ==================== BREAKDOWN ON RIPIO ==================== */}
          {(!activeSection || activeSection === 'breakdown') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>🔧</span> Panne auf Ripio — Was tun?
              </h2>

              <div className="p-3 rounded-xl bg-red-500/10 border-l-4 border-red-500 text-sm mb-3">
                <div className="font-bold text-red-400 mb-1.5">🚨 Sofort-Maßnahmen</div>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-chile-text-secondary">
                  {carRentalData.breakdownOnRipio.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm mb-3">
                <div className="font-bold text-xs mb-1.5">🎒 Notfall-Kit (immer im Auto haben)</div>
                <div className="space-y-1 text-xs text-chile-text-secondary">
                  {carRentalData.breakdownOnRipio.emergencyKit.map((item, i) => (
                    <div key={i} className="flex gap-1.5"><span className="text-chile-accent-teal flex-shrink-0">→</span> {item}</div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-chile-accent-teal/10 border-l-4 border-chile-accent-teal text-sm">
                <div className="font-bold text-chile-accent-teal mb-1">💡 Prävention</div>
                <div className="text-xs text-chile-text-secondary space-y-1">
                  <div>→ <strong className="text-white">Reserverad bei Abholung prüfen!</strong> Aufgepumpt? Werkzeug da?</div>
                  <div>→ Reifendruck täglich checken (leicht reduzieren auf Ripio: ~28-30 PSI)</div>
                  <div>→ Langsam fahren: 40-60 km/h auf Schotter</div>
                  <div>→ Große Steine und Schlaglöcher umfahren</div>
                  <div>→ Immer mindestens halben Tank behalten</div>
                  <div>→ Route vorher jemand mitteilen (Hotel, Freunde)</div>
                </div>
              </div>
            </section>
          )}

          {/* ==================== PRICES (Daily Rates) ==================== */}
          {(!activeSection || activeSection === 'prices') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>💵</span> Tagespreise (Feb/Mar 2026)
              </h2>
              <div className="space-y-2">
                {carRentalData.dailyRates.categories.map(cat => (
                  <div key={cat.category} className={`p-3 rounded-xl border flex items-center justify-between ${
                    (cat as any).recommended ? 'bg-chile-accent-teal/10 border-chile-accent-teal/30' : 'bg-white/5 border-white/5'
                  }`}>
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center gap-1.5">
                        {cat.category}
                        {(cat as any).recommended && <span className="text-[10px] bg-chile-accent-teal/20 text-chile-accent-teal px-1.5 py-0.5 rounded">⭐ Empfohlen</span>}
                      </div>
                      <div className="text-xs text-chile-text-muted">{cat.examples}</div>
                      <div className="text-[10px] text-chile-text-muted mt-0.5">{cat.transmission}</div>
                      {(cat as any).recommendedNote && (
                        <div className="text-[10px] text-chile-accent-teal mt-0.5">{(cat as any).recommendedNote}</div>
                      )}
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
                ⚠️ Automatik deutlich teurer als Schaltung. Manuelle SUVs sind selten — früh buchen!
              </div>
            </section>
          )}

          {/* ==================== BOOKING PLATFORMS ==================== */}
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
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                      platform.name.includes('LYS') || platform.name.includes('Transfercar') 
                        ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60' 
                        : 'bg-white/5 border-white/5 hover:border-chile-accent-teal/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{platform.name}</div>
                      <div className="text-[10px] text-chile-text-muted">{platform.note}</div>
                    </div>
                    <span className="text-chile-accent-teal text-xs">→</span>
                  </a>
                ))}
              </div>

              <div className="mt-3 p-3 rounded-xl bg-chile-accent-teal/10 border-l-4 border-chile-accent-teal text-sm">
                <div className="font-bold text-chile-accent-teal mb-1">🎯 Such-Einstellungen für unseren Trip</div>
                <div className="text-xs text-chile-text-secondary space-y-1">
                  <div>→ Abholung: Santiago (SCL) Airport, 3. oder 4. März 2026</div>
                  <div>→ Rückgabe: Puerto Montt (PMC) Airport, 26. oder 27. März 2026</div>
                  <div>→ Fahrzeugtyp: SUV / Crossover</div>
                  <div>→ Getriebe: Schaltung (Manual)</div>
                  <div>→ Filter: Unbegrenzte Kilometer, CDW inklusive</div>
                </div>
              </div>
            </section>
          )}

          {/* ==================== RELOCATION DEALS ==================== */}
          {(!activeSection || activeSection === 'relocation') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>🎁</span> Kostenlose Relocation Deals
              </h2>
              <div className="p-3 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 text-sm mb-3">
                <div className="font-bold text-amber-400 mb-1">🤑 März = perfektes Timing!</div>
                <div className="text-xs text-chile-text-secondary">
                  Ende Sommer: Hertz, Europcar & Mitta müssen Autos aus dem Süden nach Santiago zurückbringen. 
                  Du fährst sie für <strong className="text-white">$0/Tag</strong> — manchmal mit Benzin und TAG inklusive!
                  <div className="mt-1 text-amber-400">⚠️ Aber: Fahrzeugtyp ist vorgegeben — wahrscheinlich kein SUV. Und nur 2-5 Tage Zeitfenster.</div>
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
                  März/April = beste Zeit für Deals!
                </div>
                <div className="text-chile-accent-teal text-xs mt-1">transfercar.cl →</div>
              </a>
              <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                <div className="font-bold text-xs mb-1.5">💡 Transfercar + Mietwagen kombinieren?</div>
                <div className="text-xs text-chile-text-secondary space-y-1">
                  <div>→ Wenn es einen Deal Santiago → Süd gibt: Ersten Teil kostenlos fahren</div>
                  <div>→ Dann regulären SUV in Temuco/Puerto Montt mieten für den Rest</div>
                  <div>→ Spart die One-Way Gebühr, aber mehr Aufwand</div>
                  <div>→ Für 23 Tage Trip vermutlich besser: einen Mietwagen durchgehend</div>
                </div>
              </div>
            </section>
          )}

          {/* ==================== PRO TIPS ==================== */}
          {(!activeSection || activeSection === 'tips') && (
            <section>
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <span>🏆</span> Pro Tipps für unseren Trip
              </h2>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                  <div className="font-bold text-xs mb-1.5">🗓️ Vor der Buchung</div>
                  <div className="space-y-1 text-xs text-chile-text-secondary">
                    <div>→ <strong className="text-white">Jetzt buchen</strong> — 9-12 Monate vorher für beste Auswahl</div>
                    <div>→ Transfercar.cl regelmäßig checken ab Dezember 2025</div>
                    <div>→ Mindestens 3 Plattformen + LYS direkt vergleichen</div>
                    <div>→ <strong className="text-amber-400">Ripio-Versicherung schriftlich bestätigen lassen</strong></div>
                    <div>→ Zusatzfahrer-Gebühr verhandeln (23 Tage = Verhandlungsbasis)</div>
                    <div>→ Internationalen Führerschein beantragen (für alle 3)</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                  <div className="font-bold text-xs mb-1.5">🚗 Bei Abholung in Santiago SCL</div>
                  <div className="space-y-1 text-xs text-chile-text-secondary">
                    <div>→ ALLE 3 Fahrer müssen persönlich da sein + Führerschein + Reisepass</div>
                    <div>→ Auto komplett von außen + innen fotografieren/filmen</div>
                    <div>→ Reserverad, Wagenheber, Radschlüssel prüfen</div>
                    <div>→ Reifenprofil checken (wichtig für Ripio!)</div>
                    <div>→ Pannenhilfe-Nummer notieren + im Handy speichern</div>
                    <div>→ TAG-Transponder im Auto bestätigen lassen</div>
                    <div>→ Schriftlich bestätigen: "Autorizado para caminos de ripio"</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                  <div className="font-bold text-xs mb-1.5">🚗 Unterwegs (23 Tage)</div>
                  <div className="space-y-1 text-xs text-chile-text-secondary">
                    <div>→ Tank nie unter halbe Füllung (besonders vor Nationalparks!)</div>
                    <div>→ Copec "Pronto" = Kaffee, Essen, saubere WCs</div>
                    <div>→ Chilenische Pesos bar mitnehmen (Maut, kleine Orte)</div>
                    <div>→ Offline Maps herunterladen (Google Maps / Maps.me)</div>
                    <div>→ Nicht nachts auf Ripio fahren — kein Spaß!</div>
                    <div>→ Auf Ripio: Abstand zu Vordermann, langsam bei Gegenverkehr</div>
                    <div>→ Alle Dokumente immer im Auto (Mietvertrag, Führerschein, Reisepass)</div>
                    <div>→ "Cuidadores" passen auf Autos auf (CLP 500–1.000 Trinkgeld)</div>
                    <div>→ Nichts sichtbar im Auto lassen — Kofferraum nutzen</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                  <div className="font-bold text-xs mb-1.5">🛡️ Versicherung & Geld</div>
                  <div className="space-y-1 text-xs text-chile-text-secondary">
                    <div>→ Full CDW buchen (~$10-15/Tag extra — lohnt sich bei Ripio!)</div>
                    <div>→ Kreditkarte mit hohem Limit für Kaution (~€900 SUV)</div>
                    <div>→ Separate Reiseversicherung mit Mietwagen-Abdeckung prüfen</div>
                    <div>→ Bei Schaden: IMMER Fotos machen + Vermieter sofort anrufen</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ==================== ROAD CONDITIONS (always visible) ==================== */}
          <section>
            <h2 className="font-bold text-base mb-3 flex items-center gap-2">
              <span>🛣️</span> Straßenbedingungen
            </h2>
            <div className="p-3 rounded-xl bg-green-500/10 border-l-4 border-green-500 text-sm mb-2">
              <div className="font-bold text-green-400 mb-1">Ruta 5: Santiago → Puerto Montt</div>
              <div className="text-xs text-chile-text-secondary">
                Exzellent! Moderne 4-spurige Autobahn, komplett asphaltiert. 
                Copec-Tankstellen alle 50-80km. Jedes Auto geeignet.
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 text-sm mb-2">
              <div className="font-bold text-amber-400 mb-1">🪨 Seengebiet: Nationalparks & Vulkane</div>
              <div className="text-xs text-chile-text-secondary">
                Hauptstraßen asphaltiert, aber Zufahrten zu Vulkanen, Thermalquellen und Parks oft
                <strong className="text-amber-400"> Ripio/Schotter</strong>. SUV mit Bodenfreiheit empfohlen!
              </div>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 border-l-4 border-red-500 text-sm">
              <div className="font-bold text-red-400 mb-1">Carretera Austral: Ab Puerto Montt</div>
              <div className="text-xs text-chile-text-secondary">
                Mix aus Asphalt + Schotter + Vulkanasche. SUV/Pickup Pflicht. 
                Wenig Tankstellen — vorausplanen!
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
