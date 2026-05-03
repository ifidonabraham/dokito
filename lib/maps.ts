// ============================================
// AKILI HEALTH - Google Maps & Geolocation Utilities
// ============================================

import type { Facility } from './types'

// Generate Google Maps navigation deep link
export function getNavigationLink(
  destination: { latitude: number; longitude: number },
  travelMode: 'driving' | 'walking' | 'transit' = 'driving'
): string {
  const { latitude, longitude } = destination
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=${travelMode}`
}

// Generate Google Maps search link for nearest hospitals
export function getNearbyHospitalsLink(
  userLat: number,
  userLng: number
): string {
  return `https://www.google.com/maps/search/hospitals+near+me/@${userLat},${userLng},14z`
}

// Generate Apple Maps navigation link (for iOS)
export function getAppleMapsLink(
  destination: { latitude: number; longitude: number }
): string {
  const { latitude, longitude } = destination
  return `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`
}

// Get current user location
export function getCurrentLocation(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied. Please enable location access.'))
            break
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information unavailable.'))
            break
          case error.TIMEOUT:
            reject(new Error('Location request timed out.'))
            break
          default:
            reject(new Error('An unknown error occurred getting location.'))
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

// Watch user location for live updates
export function watchLocation(
  onUpdate: (coords: GeolocationCoordinates) => void,
  onError: (error: GeolocationPositionError) => void
): number | null {
  if (!navigator.geolocation) {
    return null
  }

  return navigator.geolocation.watchPosition(
    (position) => onUpdate(position.coords),
    onError,
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    }
  )
}

// Stop watching location
export function clearLocationWatch(watchId: number): void {
  navigator.geolocation.clearWatch(watchId)
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

// Format distance for display
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

// Estimate travel time based on distance (rough estimate)
export function estimateTravelTime(
  meters: number,
  mode: 'driving' | 'walking' = 'driving'
): number {
  // Average speeds: driving ~30km/h in Nigerian traffic, walking ~5km/h
  const speedKmh = mode === 'driving' ? 30 : 5
  const hours = meters / 1000 / speedKmh
  return Math.ceil(hours * 60) // Return minutes
}

// Find nearest facility from list
export function findNearestFacility(
  userLat: number,
  userLng: number,
  facilities: Facility[],
  hasEmergency: boolean = true
): Facility | null {
  let nearest: Facility | null = null
  let minDistance = Infinity

  for (const facility of facilities) {
    if (hasEmergency && !facility.hasEmergency) continue
    
    const distance = calculateDistance(
      userLat,
      userLng,
      facility.latitude,
      facility.longitude
    )

    if (distance < minDistance) {
      minDistance = distance
      nearest = { ...facility, distance }
    }
  }

  return nearest
}

// Sort facilities by distance
export function sortFacilitiesByDistance(
  userLat: number,
  userLng: number,
  facilities: Facility[]
): Facility[] {
  return facilities
    .map((facility) => ({
      ...facility,
      distance: calculateDistance(
        userLat,
        userLng,
        facility.latitude,
        facility.longitude
      ),
    }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0))
}

// Lagos coordinates (default center for map)
export const LAGOS_CENTER = {
  lat: 6.5244,
  lng: 3.3792,
}

// Nigeria bounds
export const NIGERIA_BOUNDS = {
  north: 13.892,
  south: 4.277,
  east: 14.680,
  west: 2.668,
}
