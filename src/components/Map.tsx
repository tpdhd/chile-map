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

// Category colors mapping
const categoryColors: Record<string, string> = {
  restaurant: '#ff6b6b',
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
}

// Category icons mapping
const categoryIcons: Record<string, string> = {
  restaurant: '🍽️',
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
function MapController({ selectedLocation }: { selectedLocation: Location | null }) {
  const map = useMap()

  useEffect(() => {
    if (selectedLocation) {
      map.flyTo(selectedLocation.coordinates as [number, number], 10, {
        duration: 1.5
      })
    }
  }, [selectedLocation, map])

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
    
    return L.divIcon({
      html: `
        <div class="custom-marker location-marker" style="
          background: ${isSelected ? '#e63946' : '#2a9d8f'};
          color: white;
        ">
          ${locationNumber}
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    })
  }

  // Create custom markers for recommendations
  const createRecommendationIcon = (recommendation: Recommendation, isSelected: boolean) => {
    const color = categoryColors[recommendation.category] || '#6b6b7b'
    const icon = categoryIcons[recommendation.category] || '📍'
    
    return L.divIcon({
      html: `
        <div class="custom-marker recommendation-marker" style="
          background: ${isSelected ? '#e63946' : color};
          color: white;
        ">
          ${icon}
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
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
      {/* Dark mode tile layer - optimized for smooth zooming */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={19}
        keepBuffer={16}
        updateWhenZooming={false}
        updateWhenIdle={true}
        tileSize={256}
        crossOrigin="anonymous"
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
      <MapController selectedLocation={selectedLocation} />
    </MapContainer>
  )
}
