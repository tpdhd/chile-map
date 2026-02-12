import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDeepLink } from '../hooks/useDeepLink'

// Mock location data matching trip-data.json structure
const mockLocations = [
  {
    id: 'santiago',
    name: 'Santiago',
    nameEs: 'Santiago de Chile',
    coordinates: [-33.4489, -70.6693],
    startDate: '2025-03-03',
    endDate: '2025-03-05',
    durationDays: 2,
    type: 'main',
    description: 'Chiles lebendige Hauptstadt',
    recommendations: [
      {
        id: 'santiago-mercado-central',
        name: 'Central Market',
        nameEs: 'Mercado Central',
        category: 'restaurant',
        description: 'Großer Fischmarkt',
        coordinates: [-33.4345, -70.6503],
        address: 'San Pablo 967',
        priceRange: '$$',
        source: 'chile.travel',
        googleMapsLink: '',
      },
      {
        id: 'santiago-cerro-san-cristobal',
        name: 'Cerro San Cristóbal',
        nameEs: 'Cerro San Cristóbal',
        category: 'viewpoint',
        description: 'Aussichtsberg',
        coordinates: [-33.4256, -70.6322],
        address: '',
        priceRange: '$',
        source: '',
        googleMapsLink: '',
      },
    ],
  },
  {
    id: 'pucon',
    name: 'Pucón Area',
    nameEs: 'Zona Pucón',
    coordinates: [-39.2753, -71.9773],
    startDate: '2025-03-15',
    endDate: '2025-03-17',
    durationDays: 3,
    type: 'main',
    description: 'Abenteuer-Hauptstadt',
    recommendations: [
      {
        id: 'pucon-volcan-villarrica',
        name: 'Volcán Villarrica',
        nameEs: 'Volcán Villarrica',
        category: 'volcano',
        description: 'Aktiver Vulkan',
        coordinates: [-39.4208, -71.9394],
        address: '',
        priceRange: '$$$',
        source: '',
        googleMapsLink: '',
      },
    ],
  },
] as any

const defaultProps = () => ({
  locations: mockLocations,
  selectedLocation: null as any,
  selectedRecommendation: null as any,
  onLocationSelect: vi.fn(),
  onRecommendationSelect: vi.fn(),
})

describe('useDeepLink', () => {
  beforeEach(() => {
    // Reset URL to clean state before each test
    window.history.replaceState({}, '', '/')
    vi.clearAllMocks()
  })

  it('parses ?loc=santiago and calls onLocationSelect', async () => {
    window.history.replaceState({}, '', '/?loc=santiago')
    const props = defaultProps()
    
    renderHook(() => useDeepLink(props))
    
    // useEffect runs after render
    await vi.waitFor(() => {
      expect(props.onLocationSelect).toHaveBeenCalledWith(mockLocations[0])
    })
  })

  it('parses ?loc=santiago&rec=santiago-mercado-central and calls both selectors', async () => {
    window.history.replaceState({}, '', '/?loc=santiago&rec=santiago-mercado-central')
    const props = defaultProps()
    
    renderHook(() => useDeepLink(props))
    
    await vi.waitFor(() => {
      expect(props.onLocationSelect).toHaveBeenCalledWith(mockLocations[0])
    })
    // Rec is called with setTimeout(100), wait a bit
    await vi.waitFor(() => {
      expect(props.onRecommendationSelect).toHaveBeenCalledWith(
        mockLocations[0].recommendations[0]
      )
    }, { timeout: 500 })
  })

  it('ignores invalid loc parameter (no crash, no call)', async () => {
    window.history.replaceState({}, '', '/?loc=nonexistent')
    const props = defaultProps()
    
    renderHook(() => useDeepLink(props))
    
    // Wait a tick for useEffect
    await new Promise(r => setTimeout(r, 50))
    expect(props.onLocationSelect).not.toHaveBeenCalled()
    expect(props.onRecommendationSelect).not.toHaveBeenCalled()
  })

  it('ignores invalid rec parameter but still selects location', async () => {
    window.history.replaceState({}, '', '/?loc=santiago&rec=nonexistent-rec')
    const props = defaultProps()
    
    renderHook(() => useDeepLink(props))
    
    await vi.waitFor(() => {
      expect(props.onLocationSelect).toHaveBeenCalledWith(mockLocations[0])
    })
    // Rec should NOT be called (invalid ID)
    await new Promise(r => setTimeout(r, 200))
    expect(props.onRecommendationSelect).not.toHaveBeenCalled()
  })

  it('does nothing on empty URL (default view)', async () => {
    window.history.replaceState({}, '', '/')
    const props = defaultProps()
    
    renderHook(() => useDeepLink(props))
    
    await new Promise(r => setTimeout(r, 50))
    expect(props.onLocationSelect).not.toHaveBeenCalled()
    expect(props.onRecommendationSelect).not.toHaveBeenCalled()
  })

  it('generates correct share URL for location + recommendation', () => {
    const props = defaultProps()
    const { result } = renderHook(() => useDeepLink(props))
    
    const url = result.current.getShareUrl('santiago', 'santiago-mercado-central')
    expect(url).toContain('loc=santiago')
    expect(url).toContain('rec=santiago-mercado-central')
    expect(url).toMatch(/\?loc=santiago&rec=santiago-mercado-central$/)
  })

  it('generates correct share URL for location only', () => {
    const props = defaultProps()
    const { result } = renderHook(() => useDeepLink(props))
    
    const url = result.current.getShareUrl('pucon')
    expect(url).toContain('loc=pucon')
    expect(url).not.toContain('rec=')
  })

  it('updates URL when selectedLocation changes', async () => {
    const props = defaultProps()
    const { rerender } = renderHook(
      (p) => useDeepLink(p),
      { initialProps: props }
    )
    
    // Wait for initial mount
    await new Promise(r => setTimeout(r, 250))
    
    // Simulate selecting a location
    rerender({
      ...props,
      selectedLocation: mockLocations[0],
    })
    
    await vi.waitFor(() => {
      expect(window.location.search).toContain('loc=santiago')
    })
  })
})
