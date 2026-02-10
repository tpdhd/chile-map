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

// Preload tiles around a coordinate to warm the browser cache
function preloadTilesAround(lat: number, lon: number, style: string = 'dark-v11', zoomLevels: number[] = [10, 12, 14], radius: number = 2) {
  const token = atob('cGsuZXlKMUlqb2liWE53WkROMklpd2lZU0k2SW1OdGJHTTNaalZ3Y2pCMk0zUXphM05uZEdsMmFIcDFiV1FpZlEuWnZaWWQ5UlRVczdUcmw0WFZ6RWRlQQ==')
  const urls: string[] = []
  
  for (const zoom of zoomLevels) {
    const n = Math.pow(2, zoom)
    const cx = Math.floor(((lon + 180) / 360) * n)
    const latRad = (lat * Math.PI) / 180
    const cy = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
    
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const x = cx + dx
        const y = cy + dy
        if (x < 0 || y < 0 || x >= n || y >= n) continue
        urls.push(
          `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/512/${zoom}/${x}/${y}@2x?access_token=${token}`
        )
      }
    }
  }
  
  // Use <link rel="prefetch"> for low-priority background loading
  const fragment = document.createDocumentFragment()
  for (const url of urls) {
    // Skip if already in DOM
    if (document.querySelector(`link[href="${url}"]`)) continue
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.as = 'image'
    link.href = url
    fragment.appendChild(link)
  }
  document.head.appendChild(fragment)
  
  // Clean up old prefetch links after 30s to keep DOM clean
  setTimeout(() => {
    document.querySelectorAll('link[rel="prefetch"][as="image"]').forEach(el => el.remove())
  }, 30000)
}

interface MapProps {
  locations: Location[]
  selectedLocation: Location | null
  selectedRecommendation: Recommendation | null
  onLocationSelect: (location: Location) => void
  onRecommendationSelect: (recommendation: Recommendation) => void
  activeCategory: string | null
  theme: 'dark' | 'light' | 'auto'
}

// Component to handle map view changes
function MapController({ 
  selectedLocation, 
  selectedRecommendation,
  mapStyle
}: { 
  selectedLocation: Location | null
  selectedRecommendation: Recommendation | null
  mapStyle: string
}) {
  const map = useMap()

  // Preload tiles when location changes
  useEffect(() => {
    if (selectedLocation) {
      const [lat, lon] = selectedLocation.coordinates as [number, number]
      preloadTilesAround(lat, lon, mapStyle)
    }
  }, [selectedLocation, mapStyle])

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

    if (selectedRecommendation) {
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
  }, [selectedLocation, selectedRecommendation, map])

  return null
}

export default function Map({
  locations,
  selectedLocation,
  selectedRecommendation,
  onLocationSelect,
  onRecommendationSelect,
  activeCategory,
  theme
}: MapProps) {
  const mapRef = useRef<L.Map>(null)

  // Determine effective theme and map style
  const effectiveTheme = theme === 'auto' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme
  
  const mapStyle = effectiveTheme === 'dark' ? 'dark-v11' : 'outdoors-v12'
  const mapboxToken = atob('cGsuZXlKMUlqb2liWE53WkROMklpd2lZU0k2SW1OdGJHTTNaalZ3Y2pCMk0zUXphM05uZEdsMmFIcDFiV1FpZlEuWnZaWWQ5UlRVczdUcmw0WFZ6RWRlQQ==')

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
      {/* Theme-aware tile layer - Mapbox Dark or Outdoors */}
      <TileLayer
        key={mapStyle}
        url={`https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/tiles/512/{z}/{x}/{y}@2x?access_token=${mapboxToken}`}
        attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={22}
        tileSize={512}
        zoomOffset={-1}
        crossOrigin="anonymous"
        className="smooth-tiles"
        maxNativeZoom={22}
        keepBuffer={16}
        updateWhenZooming={false}
        updateWhenIdle={true}
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
        mapStyle={mapStyle}
      />
    </MapContainer>
  )
}
