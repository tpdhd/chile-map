import { useState } from 'react'

interface EmergencyInfoProps {
  onClose: () => void
}

interface EmergencyItem {
  icon: string
  label: string
  number?: string
  description: string
  action?: 'call' | 'link'
  url?: string
}

interface EmergencySection {
  title: string
  icon: string
  items: EmergencyItem[]
}

const SECTIONS: EmergencySection[] = [
  {
    title: 'Notrufnummern',
    icon: '🚨',
    items: [
      {
        icon: '🚔',
        label: 'Carabineros (Polizei)',
        number: '133',
        description: 'Chilenische Polizei — landesweit erreichbar, auch auf Spanisch.',
        action: 'call',
      },
      {
        icon: '🚑',
        label: 'Ambulanz (SAMU)',
        number: '131',
        description: 'Öffentlicher Rettungsdienst. In Städten meist schnell, auf dem Land ggf. länger.',
        action: 'call',
      },
      {
        icon: '🚒',
        label: 'Feuerwehr (Bomberos)',
        number: '132',
        description: 'Freiwillige Feuerwehr — auch für technische Rettung zuständig.',
        action: 'call',
      },
      {
        icon: '📞',
        label: 'Allgemeiner Notruf',
        number: '112',
        description: 'Funktioniert von jedem Handy, auch ohne Guthaben oder SIM.',
        action: 'call',
      },
      {
        icon: '🔎',
        label: 'PDI (Kriminalpolizei)',
        number: '134',
        description: 'Für Diebstahl, Raub, Pass- oder Dokumentenverlust.',
        action: 'call',
      },
    ],
  },
  {
    title: 'Deutsche Botschaft',
    icon: '🇩🇪',
    items: [
      {
        icon: '🏛️',
        label: 'Botschaft Santiago',
        number: '+56 2 2463 2500',
        description: 'Las Hualtatas 5677, Vitacura, Santiago. Mo-Fr 8:00–12:00.',
        action: 'call',
      },
      {
        icon: '🆘',
        label: 'Notfall-Bereitschaft',
        number: '+56 2 2463 2500',
        description: '24h Bereitschaft außerhalb der Öffnungszeiten — Ansage folgen.',
        action: 'call',
      },
      {
        icon: '🌐',
        label: 'Webseite Botschaft',
        description: 'Aktuelle Reise- und Sicherheitshinweise für Chile.',
        action: 'link',
        url: 'https://santiago.diplo.de',
      },
      {
        icon: '📱',
        label: 'Auswärtiges Amt App',
        description: '„Sicher Reisen" App mit Push-Benachrichtigungen & Krisenvorsorge.',
        action: 'link',
        url: 'https://www.auswaertiges-amt.de/de/app',
      },
    ],
  },
  {
    title: 'Medizinische Hilfe',
    icon: '🏥',
    items: [
      {
        icon: '💊',
        label: 'Apotheken (Farmacias)',
        description: 'Cruz Verde, Salcobrand, Dr. Simi — fast überall, viele Medikamente rezeptfrei. 24h-Filialen in größeren Städten.',
      },
      {
        icon: '🏥',
        label: 'Clinica Alemana',
        number: '+56 2 2210 1111',
        description: 'Deutschsprachige Privatklinik in Santiago, Vitacura. Sehr guter Standard.',
        action: 'call',
      },
      {
        icon: '🩺',
        label: 'Öffentliches Krankenhaus',
        description: 'In jeder größeren Stadt. Notaufnahme (Urgencias) ohne Termin. Lange Wartezeiten möglich.',
      },
      {
        icon: '🦷',
        label: 'Zahnarzt',
        description: 'Zahnärzte günstig und gut in Chile. In Santiago auch englischsprachig.',
      },
    ],
  },
  {
    title: 'Reiseversicherung',
    icon: '🛡️',
    items: [
      {
        icon: '📋',
        label: 'Versicherungs-Hotline',
        description: 'Notiere die Telefonnummer deiner Auslandskrankenversicherung hier. Die meisten deutschen Versicherungen haben eine 24h-Hotline.',
      },
      {
        icon: '📄',
        label: 'Wichtige Dokumente',
        description: 'Kopien von Reisepass, Versicherungsschein, Impfausweis digital speichern (z.B. Google Drive oder Fotos).',
      },
    ],
  },
  {
    title: 'Praktische Tipps',
    icon: '💡',
    items: [
      {
        icon: '💳',
        label: 'Karten gesperrt?',
        description: 'Visa: +49 711 7899770. Mastercard: +1 636 7227111. Immer eine Backup-Karte mitnehmen!',
      },
      {
        icon: '🛂',
        label: 'Pass verloren?',
        description: 'Sofort PDI (134) anrufen und Diebstahlanzeige erstatten. Dann deutsche Botschaft für Notreisepass.',
      },
      {
        icon: '📶',
        label: 'Kein Netz?',
        description: 'In ländlichen Gebieten oft kein Empfang. Entel hat die beste Abdeckung im Süden. Offline-Karte vorher laden!',
      },
      {
        icon: '🚗',
        label: 'Autopanne?',
        description: 'SERNAC: 800 700 100 (Verbraucherschutz). Mietwagen-Firma direkt anrufen. ANAC: +56 2 2431 1000 (Automobilclub Chile).',
      },
      {
        icon: '🌊',
        label: 'Erdbeben / Tsunami',
        description: 'Chile ist erdbebengefährdet. Bei starkem Beben: unter stabilen Tisch, weg von Fenstern. An der Küste: sofort auf höheres Gelände (Tsunami-Risiko).',
      },
      {
        icon: '🌋',
        label: 'Vulkanausbruch',
        description: 'SERNAGEOMIN überwacht alle Vulkane. Bei Alarm: Anweisungen der Behörden folgen. Auf keinen Fall Richtung Vulkan fahren.',
      },
    ],
  },
]

export default function EmergencyInfo({ onClose }: EmergencyInfoProps) {
  const [expandedSection, setExpandedSection] = useState<number>(0)

  const handleCall = (number: string) => {
    window.open(`tel:${number.replace(/\s/g, '')}`, '_self')
  }

  return (
    <div className="absolute inset-0 z-[700] flex flex-col bg-chile-bg-primary">
      {/* Header */}
      <div
        className="flex-shrink-0 px-4 py-3 border-b border-white/10 bg-red-900/30 backdrop-blur-sm flex items-center gap-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
      >
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-lg">🆘 Notfall-Info</h1>
          <p className="text-xs text-red-300/70">Wichtige Nummern & Hinweise für Chile</p>
        </div>
      </div>

      {/* Quick-Call Bar */}
      <div className="flex-shrink-0 px-4 py-3 bg-red-950/40 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-hide">
        {[
          { emoji: '🚔', label: '133', desc: 'Polizei' },
          { emoji: '🚑', label: '131', desc: 'Ambulanz' },
          { emoji: '🚒', label: '132', desc: 'Feuer' },
          { emoji: '📞', label: '112', desc: 'Notruf' },
        ].map((q) => (
          <button
            key={q.label}
            onClick={() => handleCall(q.label)}
            className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 active:scale-95 transition-all min-w-[72px]"
          >
            <span className="text-xl">{q.emoji}</span>
            <span className="text-sm font-bold text-red-300">{q.label}</span>
            <span className="text-[9px] text-red-300/60">{q.desc}</span>
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {SECTIONS.map((section, sIdx) => {
          const isExpanded = expandedSection === sIdx
          return (
            <section key={sIdx} className="rounded-xl bg-white/5 border border-white/5 overflow-hidden">
              <button
                onClick={() => setExpandedSection(isExpanded ? -1 : sIdx)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors"
              >
                <span className="text-xl">{section.icon}</span>
                <span className="font-bold text-sm flex-1 text-left">{section.title}</span>
                <span className="text-chile-text-muted text-xs">
                  {section.items.length} {isExpanded ? '▲' : '▼'}
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-white/5 divide-y divide-white/5">
                  {section.items.map((item, iIdx) => (
                    <div key={iIdx} className="px-4 py-3 flex items-start gap-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{item.label}</span>
                          {item.number && (
                            <span className="text-xs font-mono bg-white/10 px-1.5 py-0.5 rounded text-chile-accent-teal">
                              {item.number}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-chile-text-secondary mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      {item.action === 'call' && item.number && (
                        <button
                          onClick={() => handleCall(item.number!)}
                          className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center hover:bg-green-500/30 active:scale-90 transition-all"
                        >
                          📞
                        </button>
                      )}
                      {item.action === 'link' && item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center hover:bg-blue-500/30 active:scale-90 transition-all"
                        >
                          🔗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )
        })}

        {/* Disclaimer */}
        <div className="text-[10px] text-chile-text-muted text-center pb-4 px-4 leading-relaxed">
          Stand: Februar 2025. Alle Angaben ohne Gewähr. Im Notfall immer zuerst die lokale Notrufnummer (133/131/132) wählen.
        </div>
      </div>
    </div>
  )
}
