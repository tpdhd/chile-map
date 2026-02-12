import { useEffect, useCallback, useRef } from 'react'
import type { Location, Recommendation } from '../App'

interface UseDeepLinkProps {
  locations: Location[]
  selectedLocation: Location | null
  selectedRecommendation: Recommendation | null
  onLocationSelect: (location: Location) => void
  onRecommendationSelect: (recommendation: Recommendation) => void
}

/**
 * Hook to handle deep-linking via URL parameters.
 * Supports ?loc=<locationId> and ?rec=<recommendationId>
 * 
 * - On mount: reads URL params → sets state
 * - On navigation: pushes new history entries so Back/Forward works
 * - On popstate: reads URL → updates state
 * - getShareUrl: generates copyable deep-link
 */
export function useDeepLink({
  locations,
  selectedLocation,
  selectedRecommendation,
  onLocationSelect,
  onRecommendationSelect
}: UseDeepLinkProps) {
  // Track whether the current URL change is from popstate (to avoid pushing again)
  const isPopStateRef = useRef(false)
  // Track whether this is the initial mount (use replaceState, not pushState)
  const isInitialRef = useRef(true)
  // Keep refs for popstate handler to avoid stale closures
  const locationsRef = useRef(locations)
  locationsRef.current = locations

  // Parse URL parameters and set state on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const locParam = params.get('loc')
    const recParam = params.get('rec')

    if (locParam) {
      const location = locationsRef.current.find(loc => loc.id === locParam)
      if (location) {
        onLocationSelect(location)
        if (recParam) {
          const recommendation = location.recommendations.find(rec => rec.id === recParam)
          if (recommendation) {
            // Delay slightly to ensure location state is set first
            setTimeout(() => onRecommendationSelect(recommendation), 100)
          }
        }
      }
    }
    // Mark mount as done after first render cycle
    setTimeout(() => { isInitialRef.current = false }, 200)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run only on mount

  // Update URL when selection changes
  useEffect(() => {
    // Don't push during popstate handling (would create duplicate entries)
    if (isPopStateRef.current) {
      isPopStateRef.current = false
      return
    }

    const params = new URLSearchParams()
    if (selectedLocation) {
      params.set('loc', selectedLocation.id)
    }
    if (selectedRecommendation) {
      params.set('rec', selectedRecommendation.id)
    }

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname

    // Only update if URL actually changed
    if (newUrl !== window.location.pathname + window.location.search) {
      const stateObj = { loc: selectedLocation?.id, rec: selectedRecommendation?.id }
      if (isInitialRef.current) {
        // Replace on initial load (don't pollute history)
        window.history.replaceState(stateObj, '', newUrl)
      } else {
        // Push for user-initiated navigation (enables Back/Forward)
        window.history.pushState(stateObj, '', newUrl)
      }
    }
  }, [selectedLocation, selectedRecommendation])

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      isPopStateRef.current = true
      const params = new URLSearchParams(window.location.search)
      const locParam = params.get('loc')
      const recParam = params.get('rec')

      if (!locParam) {
        // No location in URL — leave current state (don't clear map)
        return
      }

      const location = locationsRef.current.find(loc => loc.id === locParam)
      if (location) {
        onLocationSelect(location)
        if (recParam) {
          const recommendation = location.recommendations.find(rec => rec.id === recParam)
          if (recommendation) {
            onRecommendationSelect(recommendation)
          }
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [onLocationSelect, onRecommendationSelect])

  // Generate shareable URL for a location + recommendation
  const getShareUrl = useCallback((locationId: string, recommendationId?: string) => {
    const params = new URLSearchParams()
    params.set('loc', locationId)
    if (recommendationId) {
      params.set('rec', recommendationId)
    }
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`
  }, [])

  return { getShareUrl }
}
