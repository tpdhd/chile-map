import { Location } from '../App'

interface TimelineProps {
  locations: Location[]
  selectedLocation: Location | null
  onSelect: (location: Location) => void
}

// Calculate distance between two coordinates (Haversine formula)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Estimate driving time based on distance (Chilean roads: ~60km/h average)
function estimateDrivingTime(distanceKm: number): string {
  // Assume 60km/h average (winding mountain roads in southern Chile)
  const hours = distanceKm / 60
  if (hours < 1) {
    return `${Math.round(hours * 60)}min`
  } else if (hours < 2) {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  } else {
    return `${Math.round(hours * 10) / 10}h`
  }
}

export default function Timeline({ locations, selectedLocation, onSelect }: TimelineProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Calculate driving times between consecutive locations
  const drivingTimes = locations.slice(0, -1).map((loc, i) => {
    const next = locations[i + 1]
    const distance = getDistance(
      loc.coordinates[0], loc.coordinates[1],
      next.coordinates[0], next.coordinates[1]
    )
    return {
      distance: Math.round(distance),
      time: estimateDrivingTime(distance)
    }
  })

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-lg">Trip Timeline</h2>
        <span className="text-xs text-chile-text-muted">
          Total: ~{drivingTimes.reduce((acc, dt) => acc + dt.distance, 0).toLocaleString()} km
        </span>
      </div>
      <div className="flex overflow-x-auto pb-2 gap-1 items-center">
        {locations.map((location, index) => (
          <div key={location.id} className="flex items-center">
            <div className="relative group">
              <button
                onClick={() => onSelect(location)}
                className={`timeline-item flex-shrink-0 ${selectedLocation?.id === location.id ? 'active' : ''}`}
              >
                <div className="text-center">
                  <div className="font-medium text-sm">{location.name}</div>
                  <div className="text-xs text-chile-text-secondary mt-1">
                    {formatDate(location.startDate)}
                  </div>
                  <div className="text-xs text-chile-text-muted mt-0.5">
                    {location.durationDays}d
                  </div>
                </div>
              </button>
              {/* Navigate button - appears on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${location.coordinates[0]},${location.coordinates[1]}&travelmode=driving`
                  window.open(url, '_blank')
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-chile-accent-teal rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-chile-accent-green"
                title={`Navigate to ${location.name}`}
              >
                🧭
              </button>
            </div>
            {/* Driving time connector */}
            {index < locations.length - 1 && drivingTimes[index] && (
              <div className="flex flex-col items-center px-1 flex-shrink-0">
                <span className="text-chile-text-muted">→</span>
                <span className="text-[10px] text-chile-accent-teal whitespace-nowrap">
                  {drivingTimes[index].time}
                </span>
                <span className="text-[10px] text-chile-text-muted whitespace-nowrap">
                  {drivingTimes[index].distance}km
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
