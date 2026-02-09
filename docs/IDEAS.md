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
- [ ] **PWA Service Worker** für Tile-Caching
  - Tiles für Chile-Region (-55° bis -17° Lat) vorladen
  - Zoom-Level 5-12 cachen (ca. 50MB)
  - Workbox für intelligentes Caching
- [ ] **Vector Tiles** statt Raster (MapLibre GL)
  - Kleinere Downloads
  - Bessere Qualität bei allen Zoom-Leveln
  - Protomaps als Alternative
- [ ] **Tile Preloading** bei Location-Wechsel
  - Nächste Location-Tiles im Hintergrund laden

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
- [ ] Sicherheitshinweise

---

## 🎨 UI Verbesserungen

- [ ] Dark/Light Mode Toggle
- [x] Trip Statistik Dashboard ✓ (2026-02-08)
- [x] Währungsrechner CLP ↔ EUR ✓ (2026-02-08)
- [ ] Größere Touch-Targets
- [ ] Swipe-Gesten für Navigation
- [ ] Foto-Galerie pro Location
- [x] 📖 Icon für Fakten-Liste ✓
- [x] Location Highlighting (Map ↔ Menu Sync) ✓ (2026-02-07)
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
- [ ] Dark/Light Mode Toggle
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

### Status Empfehlungen (2026-02-08)
- Santiago: 22 | Quillimari: 20 | Algarrobo: 19
- Wine Resort: 22 | San Carlos: 20 ✓ | Chillán: 20
- Conguillío: 23 | Pucón: 28 | Valdivia: 25
- Osorno: 21 | Frutillar/PV: 22 | Puerto Montt/Chiloé: 38
- **Total: 280 Empfehlungen**

### Status Fakten (2026-02-09, Duplikat-Cleanup + Balance)
- **Total: 315 Fakten** (10 Duplikate entfernt, 10 neue Fakten hinzugefügt)
- Duplikat-Bereinigung: 10 Near-Duplicates entfernt (2026-02-09 02:30)
- 10 neue Fakten für Chillán (6) + Quillimari (4) als Balance-Update
- Quellen: Insight Guides 2024, Rough Guides 2023, Bradt Carretera Austral 2022
- General: 64, Chiloé/PM: 28, Santiago: 25, Frutillar/PV: 23
- Conguillío: 21, Osorno: 20, Quillimari: 20, Chillán: 20
- Valdivia: 19, Pucón: 19, Algarrobo: 19, Wine Resort: 19
- San Carlos: 18
- **Alle Locations 18+ Fakten ✓**

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

*Letzte Aktualisierung: 2026-02-09 03:00*
