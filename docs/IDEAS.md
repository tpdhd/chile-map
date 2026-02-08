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
- [ ] Sprach-Tipps (Spanisch-Phrasen)
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

### Status: 278 Fakten ✓ (2026-02-08, erweitert mit Rough Guide)
- Geographie, Kultur, Geschichte, Natur, Essen, Unique, Beach
- Mit Location-Referenzen wo relevant
- Quellen aus Insight Guides, Rough Guides, und Recherche
- 19 neue Fakten aus Rough Guide (Valdivia, Pucón, Osorno, Chillán, Santiago, Chiloé, Frutillar/PV)
- General 63, Santiago 22, Frutillar/PV 22, Chiloé 22, Valdivia 19, Pucón 18, Osorno 18, Wine Resort 18, Chillán 17, Algarrobo 16, San Carlos 16, Conguillío 15, Quillimari 12

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

### Status Empfehlungen (2026-02-08)
- Santiago: 22 | Quillimari: 20 | Algarrobo: 19
- Wine Resort: 22 | San Carlos: 20 ✓ | Chillán: 20
- Conguillío: 23 | Pucón: 28 | Valdivia: 25
- Osorno: 21 | Frutillar/PV: 22 | Puerto Montt/Chiloé: 38
- **Total: 280 Empfehlungen**

### Status Fakten (2026-02-08)
- **Total: 278 Fakten** (erweitert mit Rough Guide)
- 19 neue Fakten aus Rough Guide hinzugefügt
- Santiago: 22, Frutillar/PV: 22, Chiloé: 22, Valdivia: 19, Pucón: 18, Osorno: 18
- Alle Locations 12+ Fakten ✓

### TypeScript
- [x] Alle TS-Fehler behoben ✓ (2026-02-08)
- vite-env.d.ts für Leaflet image imports
- Optional properties (openingHours, mustTry) korrekt gecastet
- LocationPanel unused import gefixt

*Letzte Aktualisierung: 2026-02-08 22:00*
