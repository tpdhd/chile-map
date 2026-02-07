import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Location, Recommendation } from '../App'

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
}

interface MapProps {
  locations: Location[]
  selectedLocation: Location | null
  selectedRecommendation: Recommendation | null
  onLocationSelect: (location: Location) => void
  onRecommendationSelect: (recommendation: Recommendation) => void
  activeCategory: string | null
}

// Component to handle map view changes
function MapController({ 
  selectedLocation, 
  selectedRecommendation 
}: { 
  selectedLocation: Location | null
  selectedRecommendation: Recommendation | null 
}) {
  const map = useMap()

  useEffect(() => {
    if (selectedRecommendation) {
      // Fly to recommendation with moderate zoom
      // Offset center SOUTH so marker appears in TOP HALF of screen (above bottom sheet)
      const coords = selectedRecommendation.coordinates as [number, number]
      const offsetLat = coords[0] - 0.003 // Offset for top-half positioning
      map.flyTo([offsetLat, coords[1]], 11, {
        duration: 1
      })
    } else if (selectedLocation) {
      // Fly to location with lower zoom so nearby locations are visible
      // Offset center SOUTH so marker appears in TOP HALF of screen (above bottom sheet)
      // At zoom 8, need larger offset in degrees
      const coords = selectedLocation.coordinates as [number, number]
      const offsetLat = coords[0] - 0.5 // Subtract = center moves south = marker appears higher
      map.flyTo([offsetLat, coords[1]], 8, {
        duration: 1.5
      })
    }
  }, [selectedLocation, selectedRecommendation, map])

  return null
}

export default function Map({
  locations,
  selectedLocation,
  selectedRecommendation,
  onLocationSelect,
  onRecommendationSelect,
  activeCategory
}: MapProps) {
  const mapRef = useRef<L.Map>(null)

  // Create route line coordinates
  const routeCoordinates = locations.map(loc => loc.coordinates as [number, number])

  // Create custom markers for locations
  const createLocationIcon = (location: Location, isSelected: boolean) => {
    const locationNumber = locations.findIndex(l => l.id === location.id) + 1
    const selectedClass = isSelected ? 'selected' : ''
    
    return L.divIcon({
      html: `
        <div class="custom-marker location-marker ${selectedClass}" style="
          background: ${isSelected ? '#e63946' : '#2a9d8f'};
          color: white;
          ${isSelected ? 'z-index: 10000 !important;' : ''}
        ">
          ${locationNumber}
        </div>
      `,
      className: `custom-div-icon ${isSelected ? 'marker-selected' : ''}`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
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
          background: ${isSelected ? '#e63946' : color};
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

  return (
    <MapContainer
      ref={mapRef}
      center={[-33.45, -70.65] as [number, number]} // Santiago
      zoom={5}
      minZoom={4}
      maxZoom={15}
      className="h-full w-full"
      attributionControl={false}
      zoomControl={true}
    >
      {/* Dark mode tile layer - Mapbox Dark */}
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${atob('cGsuZXlKMUlqb2liWE53WkROMklpd2lZU0k2SW1OdGJHTTNaalZ3Y2pCMk0zUXphM05uZEdsMmFIcDFiV1FpZlEuWnZaWWQ5UlRVczdUcmw0WFZ6RWRlQQ==')}`}
        attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={22}
        tileSize={256}
        zoomOffset={0}
        crossOrigin="anonymous"
        className="smooth-tiles"
        maxNativeZoom={22}
      />

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
      {selectedLocation && selectedLocation.recommendations
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

      {/* Map controller for view changes */}
      <MapController 
        selectedLocation={selectedLocation} 
        selectedRecommendation={selectedRecommendation}
      />
    </MapContainer>
  )
}
