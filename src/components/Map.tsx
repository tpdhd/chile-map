import { useEffect, useRef } from 'react'
import { MapContainer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { leafletLayer } from 'protomaps-leaflet'
import { Location, Recommendation, Accommodation } from '../App'

// Fix for default Leaflet icons in Vite
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

// Category colors mapping - vibrant and distinct
const categoryColors: Record<string, string> = {
  restaurant: '#ff6b6b',
  café: '#d4a574',
  cafe: '#d4a574',
  bar: '#8b5cf6',
  hiking: '#4ecdc4',
  event: '#ffe66d',
  museum: '#95e1d3',
  nature: '#38b000',
  unique: '#ff9f1c',
  art: '#c77dff',
  hotspring: '#ff8fab',
  beach: '#00b4d8',
  winery: '#9d4edd',
  historical: '#d4a373',
  viewpoint: '#ffd60a',
  shopping: '#f72585',
  waterfall: '#38bdf8',
  volcano: '#ef4444',
  lake: '#3b82f6',
  garden: '#a3e635',
  church: '#f5d0fe',
  monument: '#a8a29e',
  theater: '#fb923c',
  nightlife: '#6366f1',
  transport: '#64748b',
  food: '#f97316',
  dessert: '#fbbf24',
  seafood: '#22d3d8',
}

// Accommodation type colors
const accommodationColors: Record<string, string> = {
  apartment: '#3b82f6',
  hotel: '#8b5cf6',
  hostel: '#10b981',
  cabana: '#f59e0b',
  house: '#ec4899',
  cabin: '#f97316',
}

// Category icons mapping - comprehensive
const categoryIcons: Record<string, string> = {
  restaurant: '🍽️',
  café: '☕',
  cafe: '☕',
  bar: '🍺',
  hiking: '🥾',
  event: '🎪',
  museum: '🏛️',
  nature: '🌲',
  unique: '⭐',
  art: '🎨',
  hotspring: '♨️',
  beach: '🏖️',
  winery: '🍷',
  historical: '🏰',
  viewpoint: '👁️',
  shopping: '🛍️',
  waterfall: '💧',
  volcano: '🌋',
  lake: '💙',
  garden: '🌺',
  church: '⛪',
  monument: '🗿',
  theater: '🎭',
  nightlife: '🌙',
  transport: '🚂',
  food: '🥘',
  dessert: '🍰',
  seafood: '🦐',
  tip: '💡',
  service: '🔧',
  info: 'ℹ️',
}

// Accommodation type icons - clean SVG house icon
const accommodationSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M12 3L4 9v12h5v-7h6v7h5V9L12 3z"/></svg>`

interface MapProps {
  locations: Location[]
  selectedLocation: Location | null
  selectedRecommendation: Recommendation | null
  onLocationSelect: (location: Location) => void
  onRecommendationSelect: (recommendation: Recommendation) => void
  activeCategory: string | null
  accommodations: Accommodation[]
  showAccommodationsOnMap: boolean
  selectedAccommodation: Accommodation | null
  onAccommodationSelect: (accommodation: Accommodation) => void
}

// Component to add protomaps-leaflet dark vector tile layer
function ProtomapsLayer() {
  const map = useMap()

  useEffect(() => {
    const layer = leafletLayer({
      url: import.meta.env.BASE_URL + 'chile-route.pmtiles',
      flavor: 'dark',
      lang: 'es',
    })
    layer.addTo(map)

    return () => {
      map.removeLayer(layer)
    }
  }, [map])

  return null
}

// Component to handle map view changes
function MapController({ 
  selectedLocation, 
  selectedRecommendation,
  selectedAccommodation 
}: { 
  selectedLocation: Location | null
  selectedRecommendation: Recommendation | null 
  selectedAccommodation: Accommodation | null
}) {
  const map = useMap()

  useEffect(() => {
    // Calculate offset: bottom sheet takes ~40% of screen, so offset by ~20% of viewport height
    // Convert pixel offset to lat degrees based on current zoom
    const getLatOffset = (zoom: number) => {
      const viewportHeight = map.getSize().y
      const offsetPixels = viewportHeight * 0.20 // 20% of viewport height
      // At the target point, convert pixel offset to lat degrees
      const point = map.project(map.getCenter(), zoom)
      const offsetPoint = L.point(point.x, point.y + offsetPixels)
      const offsetLatLng = map.unproject(offsetPoint, zoom)
      return map.getCenter().lat - offsetLatLng.lat
    }

    if (selectedAccommodation) {
      const coords = selectedAccommodation.coordinates as [number, number]
      const targetZoom = 14
      const latOffset = getLatOffset(targetZoom)
      map.flyTo([coords[0] - latOffset, coords[1]], targetZoom, {
        duration: 1
      })
    } else if (selectedRecommendation) {
      const coords = selectedRecommendation.coordinates as [number, number]
      const targetZoom = 14
      const latOffset = getLatOffset(targetZoom)
      map.flyTo([coords[0] - latOffset, coords[1]], targetZoom, {
        duration: 1
      })
    } else if (selectedLocation && selectedLocation.recommendations.length > 0) {
      const allCoords = selectedLocation.recommendations.map(
        rec => rec.coordinates as [number, number]
      )
      allCoords.push(selectedLocation.coordinates as [number, number])
      const bounds = L.latLngBounds(allCoords)
      
      // Use large bottom padding to push content into top half
      const viewportHeight = map.getSize().y
      map.flyToBounds(bounds, {
        padding: [50, 50],
        paddingBottomRight: [50, Math.round(viewportHeight * 0.40)],
        maxZoom: 14,
        duration: 1.2
      })
    } else if (selectedLocation) {
      const coords = selectedLocation.coordinates as [number, number]
      const targetZoom = 12
      const latOffset = getLatOffset(targetZoom)
      map.flyTo([coords[0] - latOffset, coords[1]], targetZoom, { duration: 1 })
    }
  }, [selectedLocation, selectedRecommendation, selectedAccommodation, map])

  return null
}

export default function Map({
  locations,
  selectedLocation,
  selectedRecommendation,
  onLocationSelect,
  onRecommendationSelect,
  activeCategory,
  accommodations,
  showAccommodationsOnMap,
  selectedAccommodation,
  onAccommodationSelect
}: MapProps) {
  const mapRef = useRef<L.Map>(null)

  // Create route line coordinates
  const routeCoordinates = locations.map(loc => loc.coordinates as [number, number])

  // Create custom markers for locations
  const createLocationIcon = (location: Location, isSelected: boolean) => {
    const locationNumber = locations.findIndex(l => l.id === location.id) + 1
    const selectedClass = isSelected ? 'selected' : ''
    const size = isSelected ? 40 : 32
    
    return L.divIcon({
      html: `
        <div class="custom-marker location-marker ${selectedClass}" style="
          background: ${isSelected ? '#22c55e' : '#2a9d8f'};
          color: white;
          ${isSelected ? 'z-index: 10000 !important;' : ''}
        ">
          ${locationNumber}
        </div>
      `,
      className: `custom-div-icon ${isSelected ? 'marker-selected' : ''}`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -size/2]
    })
  }

  // Create custom markers for recommendations
  const createRecommendationIcon = (recommendation: Recommendation, isSelected: boolean) => {
    const color = categoryColors[recommendation.category] || '#6b6b7b'
    const icon = categoryIcons[recommendation.category] || '📍'
    const selectedClass = isSelected ? 'selected' : ''
    
    return L.divIcon({
      html: `
        <div class="custom-marker recommendation-marker ${selectedClass}" style="
          background: ${isSelected ? '#22c55e' : color};
          color: white;
          ${isSelected ? 'z-index: 10000 !important;' : ''}
        ">
          ${icon}
        </div>
      `,
      className: `custom-div-icon ${isSelected ? 'marker-selected' : ''}`,
      iconSize: isSelected ? [32, 32] : [24, 24],
      iconAnchor: isSelected ? [16, 16] : [12, 12],
      popupAnchor: [0, -12]
    })
  }

  // Create custom markers for accommodations - clean SVG house icons
  const createAccommodationIcon = (accommodation: Accommodation, isSelected: boolean) => {
    const color = accommodationColors[accommodation.type] || '#6b7280'
    const selectedClass = isSelected ? 'selected' : ''
    const size = isSelected ? 34 : 28
    
    return L.divIcon({
      html: `
        <div class="custom-marker accommodation-marker ${selectedClass}" style="
          background: ${isSelected ? '#22c55e' : color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          ${isSelected ? 'z-index: 10000 !important; border-color: #22c55e; box-shadow: 0 0 12px rgba(34,197,94,0.5);' : ''}
        ">
          ${accommodationSvg}
        </div>
      `,
      className: `custom-div-icon ${isSelected ? 'marker-selected' : ''}`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -size/2]
    })
  }

  return (
    <MapContainer
      ref={mapRef}
      center={[-33.45, -70.65] as [number, number]} // Santiago
      zoom={5}
      minZoom={4}
      maxZoom={22}
      zoomSnap={0.5}
      zoomDelta={0.5}
      wheelPxPerZoomLevel={120}
      className="h-full w-full"
      attributionControl={false}
      zoomControl={false}
    >
      {/* Dark mode vector tile layer - PMTiles + protomaps-leaflet */}
      <ProtomapsLayer />

      {/* Route line */}
      <Polyline
        pathOptions={{
          color: '#9b5de5',
          weight: 3,
          opacity: 0.7,
          dashArray: '10, 6',
          className: 'route-line'
        }}
        positions={routeCoordinates}
      />

      {/* Location markers - No popup, opens bottom sheet directly */}
      {locations.map((location) => (
        <Marker
          key={location.id}
          position={location.coordinates as [number, number]}
          icon={createLocationIcon(location, selectedLocation?.id === location.id)}
          eventHandlers={{
            click: () => onLocationSelect(location),
          }}
        />
      ))}

      {/* Recommendation markers for selected location - No popup, updates bottom sheet */}
      {!showAccommodationsOnMap && selectedLocation && selectedLocation.recommendations
        .filter(rec => !activeCategory || rec.category === activeCategory)
        .map((recommendation) => (
          <Marker
            key={recommendation.id}
            position={recommendation.coordinates as [number, number]}
            icon={createRecommendationIcon(recommendation, selectedRecommendation?.id === recommendation.id)}
            eventHandlers={{
              click: () => onRecommendationSelect(recommendation),
            }}
          />
        ))}

      {/* Accommodation markers - Show when accommodations layer is active */}
      {showAccommodationsOnMap && accommodations.map((accommodation) => (
        <Marker
          key={accommodation.id}
          position={accommodation.coordinates as [number, number]}
          icon={createAccommodationIcon(accommodation, selectedAccommodation?.id === accommodation.id)}
          eventHandlers={{
            click: () => onAccommodationSelect(accommodation),
          }}
        />
      ))}

      {/* Map controller for view changes */}
      <MapController 
        selectedLocation={selectedLocation} 
        selectedRecommendation={selectedRecommendation}
        selectedAccommodation={selectedAccommodation}
      />
    </MapContainer>
  )
}
