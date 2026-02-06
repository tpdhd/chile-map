import { useState, useEffect } from 'react'

interface WeatherData {
  current: {
    temp_c: string
    condition: string
    icon: string
    humidity: string
    wind_kph: string
  }
  forecast: Array<{
    date: string
    maxTemp: string
    minTemp: string
    condition: string
    icon: string
  }>
}

// Map wttr.in weather codes to emojis
const weatherIcons: Record<string, string> = {
  '113': '☀️', // Sunny
  '116': '⛅', // Partly cloudy
  '119': '☁️', // Cloudy
  '122': '☁️', // Overcast
  '143': '🌫️', // Mist
  '176': '🌦️', // Patchy rain
  '179': '🌨️', // Patchy snow
  '182': '🌨️', // Patchy sleet
  '185': '🌨️', // Patchy freezing drizzle
  '200': '⛈️', // Thundery outbreaks
  '227': '🌨️', // Blowing snow
  '230': '🌨️', // Blizzard
  '248': '🌫️', // Fog
  '260': '🌫️', // Freezing fog
  '263': '🌧️', // Patchy light drizzle
  '266': '🌧️', // Light drizzle
  '281': '🌧️', // Freezing drizzle
  '284': '🌧️', // Heavy freezing drizzle
  '293': '🌧️', // Patchy light rain
  '296': '🌧️', // Light rain
  '299': '🌧️', // Moderate rain
  '302': '🌧️', // Heavy rain
  '305': '🌧️', // Heavy rain
  '308': '🌧️', // Heavy rain
  '311': '🌧️', // Light freezing rain
  '314': '🌧️', // Moderate freezing rain
  '317': '🌨️', // Light sleet
  '320': '🌨️', // Moderate sleet
  '323': '🌨️', // Patchy light snow
  '326': '🌨️', // Light snow
  '329': '❄️', // Patchy moderate snow
  '332': '❄️', // Moderate snow
  '335': '❄️', // Patchy heavy snow
  '338': '❄️', // Heavy snow
  '350': '🌨️', // Ice pellets
  '353': '🌧️', // Light rain shower
  '356': '🌧️', // Moderate rain shower
  '359': '🌧️', // Torrential rain shower
  '362': '🌨️', // Light sleet showers
  '365': '🌨️', // Moderate sleet showers
  '368': '🌨️', // Light snow showers
  '371': '❄️', // Moderate snow showers
  '374': '🌨️', // Light ice pellet showers
  '377': '🌨️', // Moderate ice pellet showers
  '386': '⛈️', // Patchy light rain with thunder
  '389': '⛈️', // Moderate rain with thunder
  '392': '⛈️', // Patchy light snow with thunder
  '395': '⛈️', // Moderate snow with thunder
}

interface WeatherWidgetProps {
  locationName: string
  coordinates: [number, number]
  dates: { start: string; end: string }
}

export default function WeatherWidget({ locationName, coordinates, dates }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Use coordinates for more accurate weather
        const query = `${coordinates[0]},${coordinates[1]}`
        const response = await fetch(`https://wttr.in/${query}?format=j1`)
        
        if (!response.ok) {
          throw new Error('Weather unavailable')
        }
        
        const data = await response.json()
        
        // Parse current conditions
        const current = data.current_condition[0]
        const weatherCode = current.weatherCode
        
        // Parse 3-day forecast
        const forecast = data.weather.slice(0, 3).map((day: any) => ({
          date: day.date,
          maxTemp: day.maxtempC,
          minTemp: day.mintempC,
          condition: day.hourly[4]?.weatherDesc[0]?.value || 'Unknown',
          icon: weatherIcons[day.hourly[4]?.weatherCode] || '🌤️'
        }))
        
        setWeather({
          current: {
            temp_c: current.temp_C,
            condition: current.weatherDesc[0]?.value || 'Unknown',
            icon: weatherIcons[weatherCode] || '🌤️',
            humidity: current.humidity,
            wind_kph: current.windspeedKmph
          },
          forecast
        })
      } catch (err) {
        setError('Weather unavailable')
      } finally {
        setLoading(false)
      }
    }
    
    fetchWeather()
  }, [locationName, coordinates[0], coordinates[1]])

  // Check if trip dates are in the future (show forecast message)
  const tripStart = new Date(dates.start)
  const now = new Date()
  const isFuture = tripStart > now

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-chile-bg-card animate-pulse">
        <div className="w-4 h-4 bg-chile-bg-secondary rounded" />
        <div className="w-16 h-4 bg-chile-bg-secondary rounded" />
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-chile-bg-card text-chile-text-muted text-sm">
        🌡️ --
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Compact weather display */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-chile-bg-card hover:bg-chile-bg-secondary transition-colors"
        title="Click for forecast"
      >
        <span className="text-lg">{weather.current.icon}</span>
        <span className="font-medium">{weather.current.temp_c}°C</span>
        <span className="text-xs text-chile-text-muted">▼</span>
      </button>
      
      {/* Expanded forecast dropdown */}
      {expanded && (
        <div className="absolute top-full left-0 mt-2 z-50 min-w-[280px] p-4 rounded-xl bg-chile-bg-card border border-chile-bg-secondary shadow-xl">
          {/* Current conditions */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-chile-bg-secondary">
            <span className="text-4xl">{weather.current.icon}</span>
            <div>
              <div className="text-2xl font-bold">{weather.current.temp_c}°C</div>
              <div className="text-sm text-chile-text-secondary">{weather.current.condition}</div>
            </div>
            <div className="ml-auto text-right text-xs text-chile-text-muted">
              <div>💧 {weather.current.humidity}%</div>
              <div>💨 {weather.current.wind_kph} km/h</div>
            </div>
          </div>
          
          {/* Future trip notice */}
          {isFuture && (
            <div className="mb-3 p-2 rounded bg-chile-accent-teal bg-opacity-10 text-xs text-chile-accent-teal">
              📅 Trip starts {tripStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — weather may change!
            </div>
          )}
          
          {/* 3-day forecast */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-chile-text-muted mb-2">3-Day Forecast</div>
            {weather.forecast.map((day, idx) => {
              const date = new Date(day.date)
              const dayName = idx === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })
              return (
                <div key={day.date} className="flex items-center gap-3 text-sm">
                  <span className="w-12 text-chile-text-muted">{dayName}</span>
                  <span className="text-lg">{day.icon}</span>
                  <span className="flex-1 text-chile-text-secondary truncate">{day.condition}</span>
                  <span className="font-medium">{day.maxTemp}°</span>
                  <span className="text-chile-text-muted">{day.minTemp}°</span>
                </div>
              )
            })}
          </div>
          
          {/* Close hint */}
          <div className="mt-3 pt-3 border-t border-chile-bg-secondary text-center">
            <span className="text-xs text-chile-text-muted">Click anywhere to close</span>
          </div>
        </div>
      )}
      
      {/* Click outside to close */}
      {expanded && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setExpanded(false)}
        />
      )}
    </div>
  )
}
