#!/usr/bin/env python3
"""
Translate trip-data.json descriptions to German.
Run: python3 translate-to-german.py
"""

import json
import re

# Load the data
with open('src/data/trip-data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# German translations for common English phrases (to speed up manual work)
translations = {
    # Location descriptions
    "Chile's vibrant capital with world-class dining, historic neighborhoods, and stunning Andes views": 
        "Chiles lebendige Hauptstadt mit Weltklasse-Gastronomie, historischen Vierteln und atemberaubender Anden-Aussicht",
    
    # Recommendation descriptions - Santiago
    "Historic 1872 seafood market, ranked 5th best food market by National Geographic. Try 'Donde Augusto' or 'Tio Lucho' for fresh Chilean seafood.":
        "Historischer Fischmarkt von 1872, von National Geographic zum 5. besten Lebensmittelmarkt gewählt. Probiere 'Donde Augusto' oder 'Tio Lucho' für frische chilenische Meeresfrüchte.",
    
    "722-hectare urban park with panoramic city views. Take the teleférico (cable car) or funicular up. Visit Jardín Japonés and see the Virgin statue at the summit.":
        "722 Hektar großer Stadtpark mit Panoramablick. Fahre mit der Seilbahn oder Standseilbahn hinauf. Besuche den Japanischen Garten und die Marienstatue auf dem Gipfel.",
    
    "Bohemian historic district with cafés, galleries, independent boutiques. Walk the cobblestone streets, visit antique fairs on weekends. Gateway to Cerro Santa Lucía.":
        "Bohemisches historisches Viertel mit Cafés, Galerien und unabhängigen Boutiquen. Schlendere durch die Kopfsteinpflasterstraßen, besuche am Wochenende Antiquitätenmärkte. Tor zum Cerro Santa Lucía.",
    
    "Major cultural hub with free exhibitions, theater, concerts. Modern architecture with public plazas. Check their March 2025 program for events.":
        "Kulturzentrum mit kostenlosen Ausstellungen, Theater und Konzerten. Moderne Architektur mit öffentlichen Plätzen. Schau dir das Programm für März 2025 an.",
    
    "Historic hill where Santiago was founded in 1541. Beautiful gardens, terraces with city views, Neptune Fountain. Free entry, easy walk from Lastarria.":
        "Historischer Hügel, wo Santiago 1541 gegründet wurde. Wunderschöne Gärten, Terrassen mit Stadtblick, Neptunbrunnen. Eintritt frei, kurzer Spaziergang von Lastarria.",
    
    "Chile's premier art museum in stunning neoclassical building (1910). Free entry. Adjacent to Parque Forestal, perfect for a post-museum stroll.":
        "Chiles wichtigstes Kunstmuseum in einem atemberaubenden neoklassischen Gebäude (1910). Eintritt frei. Neben dem Parque Forestal, perfekt für einen Spaziergang nach dem Museumsbesuch.",
    
    "Contemporary Chilean and Latin American art in a beautifully restored heritage house in Lastarria. Intimate, well-curated exhibitions.":
        "Zeitgenössische chilenische und lateinamerikanische Kunst in einem liebevoll restaurierten Denkmalhaus in Lastarria. Intime, gut kuratierte Ausstellungen.",
    
    "Chile's largest wine bar with 400+ Chilean wines by the glass. Excellent food pairings. Perfect introduction to Chilean wine regions.":
        "Chiles größte Weinbar mit über 400 chilenischen Weinen glasweise. Hervorragende Speisekombinationen. Perfekte Einführung in chilenische Weinregionen.",
    
    "Major music festival March 21-23, 2025 at Parque O'Higgins. International and Chilean artists across multiple stages.":
        "Großes Musikfestival vom 21.-23. März 2025 im Parque O'Higgins. Internationale und chilenische Künstler auf mehreren Bühnen.",
    
    "Chile's most famous winery, 45 min from Santiago. Tours of historic cellars, including the legendary Casillero del Diablo. Book in advance.":
        "Chiles berühmtestes Weingut, 45 Min von Santiago. Führungen durch historische Weinkeller, inkl. dem legendären Casillero del Diablo. Vorab buchen.",
    
    "World's 50 Best Restaurant. Chef Rodolfo Guzmán showcases Chilean terroir with foraged ingredients from the Andes to Patagonia. Book months ahead.":
        "Unter den 50 besten Restaurants der Welt. Chef Rodolfo Guzmán präsentiert chilenisches Terroir mit gesammelten Zutaten von den Anden bis Patagonien. Monate vorher buchen.",
    
    "Indigenous Chilean cuisine celebrating Mapuche, Rapa Nui, and Atacameño culinary traditions. Unique opportunity to taste ancestral recipes in modern presentation.":
        "Indigene chilenische Küche, die Mapuche-, Rapa Nui- und Atacameño-Traditionen feiert. Einzigartige Gelegenheit, Ahnenrezepte in moderner Präsentation zu probieren.",
}

def translate_description(desc):
    """Translate English description to German"""
    if desc in translations:
        return translations[desc]
    return desc  # Return original if no translation found

# Translate location descriptions
for loc in data['locations']:
    if 'description' in loc:
        loc['description'] = translate_description(loc['description'])
    
    # Translate recommendation descriptions
    for rec in loc.get('recommendations', []):
        if 'description' in rec:
            rec['description'] = translate_description(rec['description'])

# Save the translated data
with open('src/data/trip-data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Count translations applied
translated = sum(1 for t in translations.values() if t)
print(f"Applied {translated} translations")
print("Note: Many descriptions still need manual translation")
