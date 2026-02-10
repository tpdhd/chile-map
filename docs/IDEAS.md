# Chile Map - Feature Ideas & Improvements

*Protokoll für Ideen während der Nacht-Sessions*

---

## 🚀 Performance-Optimierungen

### Tile Loading (ERLEDIGT ✓)
- **Problem:** Tiles laggten beim Zoom
- **Lösung (implementiert):**
  - `keepBuffer: 16` erhöht (von 8) - mehr Tiles im Speicher
  - `crossOrigin: "anonymous"` - ermöglicht besseres Caching
  - `updateWhenZooming: false` - keine Updates während Zoom-Animation
  - `updateWhenIdle: true` - Tiles nur laden wenn Map still steht

### Weitere Optionen (TODO)
- [ ] **Vector Tiles** statt Raster (MapLibre GL)
  - Kleinere Downloads
  - Bessere Qualität bei allen Zoom-Leveln
  - Protomaps als Alternative
- [x] **Tile Preloading** bei Location-Wechsel ✓ (2026-02-10)
  - `<link rel="prefetch">` für Tiles um die ausgewählte Location
  - Zoom-Level 10, 12, 14 mit Radius 2 vorgeladen
  - Auto-Cleanup nach 30s um DOM sauber zu halten

---

## 🧮 Utilities (Burger Menu)

### Chilean Peso ↔ Euro Rechner ✓ (2026-02-08)
- ✓ Aktueller Wechselkurs via exchangerate-api.com (6h Cache)
- ✓ Bidirektionale Umrechnung (CLP ↔ EUR)
- ✓ Schnellreferenz-Tabellen für gängige Beträge
- ✓ Trinkgeld-Guide Chile
- ✓ Typische Preise Referenztabelle

### Trip Statistik Dashboard ✓ (2026-02-08)
- ✓ Fortschritts-Ring (% besucht)
- ✓ Favoriten, Besucht, Notizen, Fakten Zähler
- ✓ Fortschritt pro Ort mit Balken
- ✓ Kategorie-Breakdown
- ✓ Trip Countdown / Status

### Offline-Modus ✓
- ✓ Karten-Tiles cachen (PWA Service Worker)
- ✓ Daten lokal speichern (localStorage)
- ✓ Manuelles Tile-Prefetching in Einstellungen

---

## 📍 Daten-Erweiterungen

### Mehr Kategorien
- [ ] Supermärkte / Einkaufen
- [ ] Tankstellen
- [ ] Camping-Plätze
- [ ] Hostels / Unterkünfte
- [ ] Notfall (Krankenhaus, Polizei)

### Bessere Infos pro Location
- [ ] Beste Reisezeit / Wetter
- [ ] Typische Preise
- [x] Sprach-Tipps (Spanisch-Phrasen) ✓ (2026-02-08, Sprachführer mit 100+ Phrasen)
- [x] Sicherheitshinweise / Reisetipps ✓ (2026-02-10) — 43 praktische Tips für alle 12 Orte

---

## 🎨 UI Verbesserungen

- [x] Dark/Light Mode Toggle ✓ (2026-02-10) — ☀️/🌙 Button, CSS-Variablen, Mapbox Outdoors für Light
- [x] Trip Statistik Dashboard ✓ (2026-02-08)
- [x] Währungsrechner CLP ↔ EUR ✓ (2026-02-08)
- [x] Größere Touch-Targets ✓ (2026-02-10) — Favorit/Maps-Buttons 28→36px, Close-Buttons 32→40px
- [x] Swipe-Gesten für Bottom Sheet ✓ (2026-02-09) — Handle-Swipe auf/zu
- [ ] Foto-Galerie pro Location
- [x] 📖 Icon für Fakten-Liste ✓
- [x] Location Highlighting (Map ↔ Menu Sync) ✓ (2026-02-07)
- [x] Kategorie-Icons vollständig ✓ (2026-02-09) — 18 Kategorien mit Icons
- [x] Deutsche Übersetzung vollständig ✓ (2026-02-09) — LoadingState, Tooltips, lang="de"
  - Map-Klick → öffnet Picker, scrollt zur Location, Flash-Effekt
  - Menu-Klick → Map fliegt hin, Marker pulst rot
  - Empfehlung-Klick → Bottom Sheet scrollt + highlightet
- [x] Kategorie Icons auf Map + Liste ✓
- [x] Sprache → Deutsch ✓ (Labels, Buttons, Kategorie-Namen)

---

## 📚 Aus Büchern extrahieren

### Insight Guides Chile (2024)
- ✓ Santiago: La Moneda, Plaza de Armas, GAM Details
- ✓ Sustainable tourism info
- ✓ Mapuche culture background
- ✓ Wine regions

### Rough Guide Chile (2023)  
- ✓ Lake District details (Pucón, Valdivia, Puerto Varas, Frutillar)
- ✓ Chiloé mythology & traditions
- ✓ Restaurant recommendations (Pucón, Valdivia, Puerto Varas)
- ✓ Historical details (Osorno, Chillán, Santiago)
- ✓ 19 neue Fakten extrahiert (2026-02-08)

### Carretera Austral Guide (2022)
- (nicht auf dieser Route)

---

## 📊 Fakten-Feature

### Status: 315 Fakten ✓ (2026-02-09, 3 Bücher extrahiert)
- Geographie, Kultur, Geschichte, Natur, Essen, Unique, Beach
- Mit Location-Referenzen wo relevant
- Quellen: Insight Guides 2024, Rough Guides 2023, Bradt Carretera Austral 2022
- Alle Locations 17+ Fakten ✓

### UI für Fakten (ERLEDIGT ✓ 2026-02-07)
- ✓ 📖 Icon im Burger-Menu
- ✓ Schöne Fakten-Karten mit Navigation
- ✓ Zufälliger Fakt beim Öffnen
- ✓ Fakten nach Location filtern
- ✓ Kategorie-Badges (Natur, Geschichte, Kultur, etc.)
- ✓ Vor/Zurück + Zufalls-Button

---

## 🚧 Noch zu tun

### Git Push / Deploy
- [x] Git credentials konfigurieren ✓ (gh auth via keyring)
- [x] Git push erfolgreich ✓ (2026-02-08)
- [ ] Cloudflare Pages deploy braucht CLOUDFLARE_API_TOKEN env var

### Weitere Erweiterungen  
- [x] Mehr Empfehlungen aus Büchern für Wine Resort ✓ (14→22 recs, 2026-02-07)
- [ ] PWA Service Worker für Offline-Tiles
- [x] Dark/Light Mode Toggle ✓ (2026-02-10)
- [ ] Foto-Galerie pro Location

### Wetter-Widget integriert (2026-02-09)
- ✓ WeatherWidget in Header eingebaut (zeigt aktuelle Temperatur)
- ✓ Widget auf Deutsch übersetzt (Vorhersage, Heute, etc.)
- ✓ Z-Index und Styling an Dark-Theme angepasst

### Packliste / Checklist (2026-02-09)
- ✓ 🧳 Packliste mit 50+ Items in 6 Kategorien
- ✓ Dokumente, Technik, Kleidung, Toilettenartikel, Reise-Essentials, Vor Abreise
- ✓ Eigene Items hinzufügen möglich
- ✓ Fortschrittsbalken mit Prozentanzeige
- ✓ localStorage-Persistenz
- ✓ Aufklappbare Kategorien mit Zähler

### Status Empfehlungen (2026-02-09)
- Santiago: 22 | Quillimari: 20 | Algarrobo: 22
- Wine Resort: 22 | San Carlos: 20 ✓ | Chillán: 20
- Conguillío: 23 | Pucón: 28 | Valdivia: 25
- Osorno: 21 | Frutillar/PV: 22 | Puerto Montt/Chiloé: 38
- **Total: 282 Empfehlungen** ✓ (Alle Locations 20+ Recs, Sierra Nevada duplicate merged)

### Status Fakten (2026-02-10, Deduplicated)
- **Total: 319 Fakten** ✓ (14 Duplikate entfernt, 8 neue unique Fakten)
- Quellen: Insight Guides 2024, Rough Guides 2023, Bradt Carretera Austral 2022
- Chiloé/PM: 27, Santiago: 23, Frutillar/PV: 22
- San Carlos: 21, Conguillío: 21, Pucón: 21, Algarrobo: 21
- Quillimari: 20, Valdivia: 20, Osorno: 20, Wine Resort: 20, Chillán: 20
- General: 63
- **Alle Locations 20+ Fakten ✓**

### TypeScript
- [x] Alle TS-Fehler behoben ✓ (2026-02-08)
- vite-env.d.ts für Leaflet image imports
- Optional properties (openingHours, mustTry) korrekt gecastet
- LocationPanel unused import gefixt

### Sprachführer (2026-02-08, Nacht-Session)
- ✓ 10 Kategorien: Grundlagen, Restaurant, Unterwegs, Einkaufen, Notfall, Unterkunft, Chilenisch, Essen, Natur, Zahlen
- ✓ 100+ Phrasen mit deutscher phonetischer Aussprache
- ✓ Chilenischer Slang (Weón, Bacán, Luca, Gamba, etc.)
- ✓ Kultur-Notizen bei Chile-spezifischem Vokabular
- ✓ Suchfunktion über alle Kategorien
- ✓ Aufklappbare Karten mit Aussprache + Tipps

### Reiseroute (2026-02-09)
- ✓ 🗺️ Vollständige Reiseroute-Übersicht
- ✓ Fahrzeiten & Distanzen zwischen allen Orten
- ✓ Trip-Zusammenfassung (Gesamtkilometer, Fahrzeit, Empfehlungen, Favoriten)
- ✓ Fortschrittsbalken (Besucht-Status)
- ✓ Aufklappbare Orte mit Top-Empfehlungen
- ✓ Google Maps Navigation (pro Ort + komplette Route)
- ✓ Visueller Timeline-Stil mit Verbindungslinien

### Notfall-Info (2026-02-09)
- ✓ 🆘 Notfall-Seite mit allen wichtigen Nummern
- ✓ Quick-Call Bar: Polizei (133), Ambulanz (131), Feuerwehr (132), Notruf (112)
- ✓ Deutsche Botschaft Santiago + Notfall-Bereitschaft
- ✓ Medizinische Hilfe: Kliniken, Apotheken, Zahnarzt
- ✓ Reiseversicherung Hinweise
- ✓ Praktische Tipps: Karten gesperrt, Pass verloren, Autopanne, Erdbeben/Tsunami, Vulkan
- ✓ Aufklappbare Sektionen, direkte Anruf-Buttons

### Tagesplan (2026-02-09)
- ✓ 📅 Automatische Tagesplanung pro Location
- ✓ Empfehlungen nach Tageszeit aufgeteilt (Vormittag/Mittag/Nachmittag/Abend)
- ✓ Intelligente Zuordnung nach Kategorie
- ✓ Favoriten werden bevorzugt eingeplant
- ✓ Horizontal scrollbare Location-Tabs
- ✓ Datum + Wochentag pro Tag angezeigt

### In der Nähe / GPS (2026-02-09)
- ✓ 📍 GPS-basierte Nearby-Suche
- ✓ Haversine-Distanzberechnung
- ✓ Lauf-/Fahrzeit-Schätzungen
- ✓ Filter: Kategorie, Umkreis (1-100km), Favoriten
- ✓ Direkte Google Maps Navigation
- ✓ Hinweis wenn nicht in Chile

### Reisezitate (2026-02-09)
- ✓ ✨ 24 Zitate über Chile
- ✓ Neruda, Allende, Darwin, Mistral, Violeta Parra, Sprichwörter
- ✓ Spanische Originalversionen wo verfügbar
- ✓ Location-Filter (📍 Button zeigt Zitate zum aktuellen Ort)
- ✓ Karussell mit Vor/Zurück/Zufall Navigation

### Map Performance Upgrade (2026-02-09)
- ✓ 512px Mapbox tiles (statt 256px) = 75% weniger Tile-Requests
- ✓ Bessere Retina-Qualität auf Mobilgeräten
- ✓ zoomOffset: -1 für korrekte 512px Zuordnung

### UX Cleanup (2026-02-09, 04:30)
- ✓ Burger Menu in Sektionen gruppiert (Planung, Wissen, Tools, System)
- ✓ Swipe-Gesten für Bottom Sheet Handle
- ✓ Ungenutzte Komponenten entfernt (Timeline.tsx, LocationPanel.tsx → -894 Zeilen)
- ✓ Kompakteres Menu (py-2.5 statt py-3)
- ✓ Info Credits korrigiert (CARTO → Mapbox)

### Git Push (2026-02-09, 06:00)
- ✓ Dist rebuild + push to GitHub
- ✓ Clean working tree, all changes committed

### Reisetipps pro Ort (2026-02-10)
- ✓ 43 praktische Reisetipps für alle 12 Locations
- ✓ Aufklappbare "💡 Reisetipps" Sektion im Bottom Sheet
- ✓ Nur sichtbar ohne Filter/Suche (ungestörtes Browsen)
- ✓ Infos zu: Transport, Essen, Sicherheit, Wetter, Must-Dos

### Data Cleanup (2026-02-10)
- ✓ Doppelter Sierra Nevada Trail zusammengeführt (283→282 Recs)
- ✓ Falsche Kategorien korrigiert (info→event, service→activity, tip→unique)
- ✓ AccommodationsPage + SuitGuide entfernt (-6000 Zeilen)
- ✓ Stale Category-Icons bereinigt (Map.tsx)
- ✓ Touch-Targets vergrößert (w-7→w-9, w-8→w-10)

### Tile Preloading (2026-02-10)
- ✓ Automatisches Tile-Prefetching bei Location-Wechsel
- ✓ `<link rel="prefetch" as="image">` für Low-Priority Background Loading
- ✓ Zoom-Level 10, 12, 14 mit Radius 2 Tiles
- ✓ Auto-Cleanup nach 30 Sekunden
- ✓ PWA Service Worker cached die Tiles dann dauerhaft

### Fakten Deduplizierung (2026-02-10, 02:00)
- ✓ 14 echte Duplikate entfernt (Pichi/Pichidangui 3x, Los Molles 2x, La Quintrala, Isla de los Lobos, Casablanca Morandé, Colonia Dignidad, Chillán zerstört, O'Higgins, Feria Chillán, Los Vilos Lord Willow)
- ✓ 8 neue unique Fakten aus Rough Guide (Zapallar, Papudo, Cachagua, Panamericana Küste, La Ligua Ostern, Valle Las Trancas, Aguas Calientes, Zentraltal Pferdegespanne)
- ✓ Alle Locations weiterhin 20+ Fakten

*Letzte Aktualisierung: 2026-02-10 02:00*
