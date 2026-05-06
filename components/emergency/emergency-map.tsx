'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, Clock, MapPin, RefreshCw, Route } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useEmergencyStore } from '@/stores/emergency-store'
import { formatDistance, getCurrentLocation } from '@/lib/maps'
import type { Facility } from '@/lib/types'

interface EmergencyMapProps {
  onFacilitySelected?: (facility: Facility) => void
}

type JourneyStatus = 'loading' | 'routing' | 'active' | 'error'

const GOOGLE_MAPS_SCRIPT_ID = 'akili-google-maps'

export function EmergencyMap({ onFacilitySelected }: EmergencyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const hiddenPlacesRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null)
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastRouteAtRef = useRef(0)

  const {
    currentLocation,
    destination,
    eta,
    distance,
    setCurrentLocation,
    setDestination,
    updateJourney,
  } = useEmergencyStore()

  const [status, setStatus] = useState<JourneyStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [routeWarning, setRouteWarning] = useState<string | null>(null)
  const [nearbyFacilities, setNearbyFacilities] = useState<Facility[]>([])
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const drawFallbackMarkers = useCallback((origin: google.maps.LatLngLiteral, facility: Facility) => {
    const map = mapInstanceRef.current
    if (!map) return

    new google.maps.Marker({
      position: origin,
      map,
      title: 'Your location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#0a84ff',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
    })

    new google.maps.Marker({
      position: { lat: facility.latitude, lng: facility.longitude },
      map,
      title: facility.name,
    })

    new google.maps.Polyline({
      path: [origin, { lat: facility.latitude, lng: facility.longitude }],
      geodesic: true,
      strokeColor: '#dc2626',
      strokeOpacity: 0.85,
      strokeWeight: 5,
      map,
    })

    const bounds = new google.maps.LatLngBounds()
    bounds.extend(origin)
    bounds.extend({ lat: facility.latitude, lng: facility.longitude })
    map.fitBounds(bounds)
  }, [])

  const routeToFacility = useCallback(
    async (origin: google.maps.LatLngLiteral, facility: Facility, force = false) => {
      const directionsService = directionsServiceRef.current
      const directionsRenderer = directionsRendererRef.current

      if (!directionsService || !directionsRenderer) return

      const now = Date.now()
      if (!force && now - lastRouteAtRef.current < 12000) return
      lastRouteAtRef.current = now

      setStatus((current) => (current === 'active' ? current : 'routing'))

      const result = await getDirections(directionsService, {
          origin,
          destination: { lat: facility.latitude, lng: facility.longitude },
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: false,
        })

      if (result.status !== google.maps.DirectionsStatus.OK || !result.route) {
        const fallbackDistance = getMetersBetween(origin, {
          lat: facility.latitude,
          lng: facility.longitude,
        })
        const fallbackEta = Math.max(Math.ceil((fallbackDistance / 1000 / 25) * 60), 1)
        const totalSeconds = elapsedSeconds + fallbackEta * 60
        const progress = totalSeconds > 0 ? Math.min((elapsedSeconds / totalSeconds) * 100, 100) : 0

        drawFallbackMarkers(origin, facility)
        updateJourney(fallbackEta, fallbackDistance, progress)
        setRouteWarning(
          `Google Directions could not draw the road route (${result.status}). Showing nearest facility and emergency estimate inside AKILI.`
        )
        setStatus('active')
        return
      }

      directionsRenderer.setDirections(result.route)
      setRouteWarning(null)

      const leg = result.route.routes[0]?.legs[0]
      const remainingDistance = leg?.distance?.value ?? facility.distance ?? 0
      const remainingEta = leg?.duration?.value ? Math.max(Math.ceil(leg.duration.value / 60), 1) : facility.eta ?? 0
        const totalSeconds = elapsedSeconds + remainingEta * 60
        const progress = totalSeconds > 0 ? Math.min((elapsedSeconds / totalSeconds) * 100, 100) : 0

        updateJourney(remainingEta, remainingDistance, progress)
        setStatus('active')
    },
    [drawFallbackMarkers, elapsedSeconds, updateJourney]
  )

  const startLiveJourney = useCallback(
    (facility: Facility, origin: google.maps.LatLngLiteral) => {
      setDestination(facility)
      onFacilitySelected?.(facility)
      setElapsedSeconds(0)
      routeToFacility(origin, facility, true)

      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current)
      elapsedTimerRef.current = setInterval(() => {
        setElapsedSeconds((seconds) => seconds + 1)
      }, 1000)

      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }

      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const liveOrigin = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            setCurrentLocation(position.coords)
            routeToFacility(liveOrigin, facility)
          },
          () => {
            setError('Live location updates stopped. The route remains visible; call 112 if you need help.')
          },
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        )
      }
    },
    [onFacilitySelected, routeToFacility, setCurrentLocation, setDestination]
  )

  const findNearestCare = useCallback(
    async (origin: google.maps.LatLngLiteral) => {
      const map = mapInstanceRef.current
      if (!map) return

      hiddenPlacesRef.current = hiddenPlacesRef.current ?? document.createElement('div')
      const places = new google.maps.places.PlacesService(hiddenPlacesRef.current)

      const results = await searchNearbyCare(places, origin)
      const facilities = results
        .map(placeToFacility)
        .filter(Boolean)
        .sort((a, b) => {
          const distanceA = getMetersBetween(origin, { lat: a!.latitude, lng: a!.longitude })
          const distanceB = getMetersBetween(origin, { lat: b!.latitude, lng: b!.longitude })
          return distanceA - distanceB
        }) as Facility[]

      const fallbackFacilities = facilities.length > 0 ? facilities : await fetchLocalEmergencyFacilities(origin)

      if (fallbackFacilities.length === 0) {
        setError('Google Places was denied and no saved emergency facility is available nearby. Call 112 now and try again.')
        setStatus('error')
        return
      }

      setNearbyFacilities(fallbackFacilities)
      startLiveJourney(fallbackFacilities[0], origin)
    },
    [startLiveJourney]
  )

  const startEmergencyMap = useCallback(async () => {
    setStatus('loading')
    setError(null)
    setNearbyFacilities([])

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setError('Google Maps API key is missing. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY before using in-app emergency navigation.')
      setStatus('error')
      return
    }

    try {
      await loadGoogleMaps(apiKey)
      const coords = await getCurrentLocation()
      setCurrentLocation(coords)

      const origin = { lat: coords.latitude, lng: coords.longitude }
      const map = new google.maps.Map(mapRef.current as HTMLDivElement, {
        center: origin,
        zoom: 15,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      })

      mapInstanceRef.current = map
      directionsServiceRef.current = new google.maps.DirectionsService()
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
        preserveViewport: false,
      })

      new google.maps.Marker({
        position: origin,
        map,
        title: 'Your location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#0a84ff',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      })

      await findNearestCare(origin)
    } catch (err) {
      try {
        const coords = await getCurrentLocation()
        const origin = { lat: coords.latitude, lng: coords.longitude }
        const fallbackFacilities = await fetchLocalEmergencyFacilities(origin)

        if (fallbackFacilities.length > 0) {
          setNearbyFacilities(fallbackFacilities)
          startLiveJourney(fallbackFacilities[0], origin)
          return
        }
      } catch {
        // The original map error is more useful.
      }

      setError(err instanceof Error ? err.message : 'Google Maps could not start. Call 112 immediately and try again.')
      setStatus('error')
    }
  }, [findNearestCare, setCurrentLocation, startLiveJourney])

  useEffect(() => {
    startEmergencyMap()

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current)
    }
  }, [startEmergencyMap])

  useEffect(() => {
    if (!destination || status !== 'active') return

    const remainingSeconds = Math.max((eta ?? 0) * 60, 0)
    const totalSeconds = elapsedSeconds + remainingSeconds
    const progress = totalSeconds > 0 ? Math.min((elapsedSeconds / totalSeconds) * 100, 100) : 0
    updateJourney(eta ?? 0, distance ?? 0, progress)
  }, [destination, distance, elapsedSeconds, eta, status, updateJourney])

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-64 w-full overflow-hidden rounded-lg border border-primary/20 bg-muted sm:h-80">
        <div ref={mapRef} className="h-full w-full" />

        {(status === 'loading' || status === 'routing') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background p-4 text-center">
            <RefreshCw className="mb-3 h-8 w-8 animate-spin text-primary" />
            <p className="font-semibold text-foreground">
              {status === 'loading' ? 'Finding your location and nearest care...' : 'Starting in-app emergency route...'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Do not wait to call 112 if the situation is critical.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background p-4 text-center">
            <AlertTriangle className="mb-3 h-9 w-9 text-destructive" />
            <p className="max-w-sm text-sm font-semibold text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={startEmergencyMap} className="mt-3">
              Try Map Again
            </Button>
          </div>
        )}

        {status === 'active' && destination && (
          <div className="absolute bottom-0 left-0 right-0 border-t bg-background/95 p-3 shadow-lg">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-muted-foreground">Used</p>
                <p className="font-semibold text-foreground">{formatElapsed(elapsedSeconds)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Remaining</p>
                <p className="font-semibold text-foreground">{eta ?? '--'} min</p>
              </div>
              <div>
                <p className="text-muted-foreground">Distance</p>
                <p className="font-semibold text-foreground">{distance ? formatDistance(distance) : '--'}</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${useEmergencyStore.getState().routeProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {routeWarning && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
          {routeWarning}
        </div>
      )}

      {destination && (
        <Card className="border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Journey started</p>
              <h3 className="truncate font-semibold text-foreground">{destination.name}</h3>
              <p className="truncate text-sm text-muted-foreground">{destination.address}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1 text-primary">
                  <Clock className="h-4 w-4" />
                  {eta ?? '--'} min left
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Route className="h-4 w-4" />
                  {distance ? formatDistance(distance) : 'Distance updating'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {nearbyFacilities.length > 1 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Other nearby care options</h3>
          {nearbyFacilities.slice(1, 4).map((facility) => (
            <button
              key={facility.id}
              type="button"
              onClick={() => {
                if (!currentLocation) return
                startLiveJourney(facility, {
                  lat: currentLocation.latitude,
                  lng: currentLocation.longitude,
                })
              }}
              className="w-full rounded-lg border bg-card p-3 text-left transition hover:border-primary/50"
            >
              <p className="truncate text-sm font-semibold text-foreground">{facility.name}</p>
              <p className="truncate text-xs text-muted-foreground">{facility.address}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function loadGoogleMaps(apiKey: string) {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.maps?.places) {
      resolve()
      return
    }

    const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load. Check the Maps API key and billing setup.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_MAPS_SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google Maps failed to load. Check the Maps API key and billing setup.'))
    document.head.appendChild(script)
  })
}

function getDirections(
  directionsService: google.maps.DirectionsService,
  request: google.maps.DirectionsRequest
) {
  return new Promise<{ route: google.maps.DirectionsResult | null; status: google.maps.DirectionsStatus }>((resolve) => {
    directionsService.route(request, (result, status) => {
      resolve({
        route: result ?? null,
        status,
      })
    })
  })
}

function searchNearbyCare(
  places: google.maps.places.PlacesService,
  origin: google.maps.LatLngLiteral
) {
  const nearbyTerms = [
    'hospital',
    'medical centre',
    'medical center',
    'health centre',
    'health center',
    'clinic',
    'university medical centre',
    'campus medical centre',
    'pharmacy',
  ]

  const textQueries = [
    `hospital near ${origin.lat},${origin.lng}`,
    `medical centre near ${origin.lat},${origin.lng}`,
    `health centre near ${origin.lat},${origin.lng}`,
    `clinic near ${origin.lat},${origin.lng}`,
  ]

  return runHealthcareSearches(places, origin, nearbyTerms, textQueries)
}

async function runHealthcareSearches(
  places: google.maps.places.PlacesService,
  origin: google.maps.LatLngLiteral,
  nearbyTerms: string[],
  textQueries: string[]
) {
  const allResults: google.maps.places.PlaceResult[] = []
  const statuses: string[] = []

  for (const keyword of nearbyTerms) {
    const { results, status } = await nearbySearch(places, origin, keyword)
    statuses.push(`${keyword}: ${status}`)
    allResults.push(...results)

    if (allResults.length >= 5) break
  }

  if (allResults.length === 0) {
    for (const query of textQueries) {
      const { results, status } = await textSearch(places, origin, query)
      statuses.push(`${query}: ${status}`)
      allResults.push(...results)

      if (allResults.length >= 5) break
    }
  }

  const uniqueResults = uniquePlaces(allResults)

  if (uniqueResults.length === 0) {
    throw new Error(
      `Google Maps could not find nearby healthcare facilities. Places status: ${statuses.join('; ')}. Call 112 immediately.`
    )
  }

  return uniqueResults.sort((a, b) => {
    const aLocation = a.geometry?.location
    const bLocation = b.geometry?.location
    if (!aLocation || !bLocation) return 0

    return (
      getMetersBetween(origin, { lat: aLocation.lat(), lng: aLocation.lng() }) -
      getMetersBetween(origin, { lat: bLocation.lat(), lng: bLocation.lng() })
    )
  })
}

function nearbySearch(
  places: google.maps.places.PlacesService,
  origin: google.maps.LatLngLiteral,
  keyword: string
) {
  return new Promise<{ results: google.maps.places.PlaceResult[]; status: string }>((resolve) => {
    places.nearbySearch(
      {
        location: origin,
        rankBy: google.maps.places.RankBy.DISTANCE,
        keyword,
      },
      (results, status) => {
        resolve({
          results: status === google.maps.places.PlacesServiceStatus.OK && results ? results : [],
          status,
        })
      }
    )
  })
}

function textSearch(
  places: google.maps.places.PlacesService,
  origin: google.maps.LatLngLiteral,
  query: string
) {
  return new Promise<{ results: google.maps.places.PlaceResult[]; status: string }>((resolve) => {
    places.textSearch(
      {
        query,
        location: origin,
        radius: 10000,
      },
      (results, status) => {
        resolve({
          results: status === google.maps.places.PlacesServiceStatus.OK && results ? results : [],
          status,
        })
      }
    )
  })
}

function uniquePlaces(results: google.maps.places.PlaceResult[]) {
  const seen = new Set<string>()

  return results.filter((place) => {
    const key = place.place_id || place.name
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function placeToFacility(place: google.maps.places.PlaceResult): Facility | null {
  const lat = place.geometry?.location?.lat()
  const lng = place.geometry?.location?.lng()

  if (typeof lat !== 'number' || typeof lng !== 'number' || !place.place_id || !place.name) {
    return null
  }

  return {
    id: place.place_id,
    name: place.name,
    type: normalizeFacilityType(place.types ?? []),
    address: place.vicinity || place.formatted_address || 'Address not available',
    state: '',
    lga: '',
    latitude: lat,
    longitude: lng,
    services: place.types ?? [],
    hasEmergency: true,
    isOpen24Hours: Boolean(place.opening_hours?.open_now),
    averageRating: place.rating ?? 0,
    totalRatings: place.user_ratings_total ?? 0,
    isVerified: true,
  }
}

async function fetchLocalEmergencyFacilities(origin: google.maps.LatLngLiteral) {
  const response = await fetch(
    `/api/facilities?lat=${origin.lat}&lng=${origin.lng}&hasEmergency=true&limit=5`
  )
  const data = await response.json()

  return ((data.facilities || []) as ApiFallbackFacility[])
    .map((facility) => {
      const latitude = facility.latitude ?? facility.location?.lat
      const longitude = facility.longitude ?? facility.location?.lng
      if (typeof latitude !== 'number' || typeof longitude !== 'number') return null

      return {
        id: facility.id,
        name: facility.name,
        type: normalizeFacilityType([facility.type]),
        address: facility.address,
        state: facility.state ?? '',
        lga: facility.lga ?? '',
        latitude,
        longitude,
        phone: facility.phone,
        services: facility.services ?? [],
        hasEmergency: Boolean(facility.hasEmergency),
        isOpen24Hours: Boolean(facility.is24Hours),
        averageRating: facility.rating ?? 0,
        totalRatings: 0,
        isVerified: true,
        distance: getMetersBetween(origin, { lat: latitude, lng: longitude }),
        eta: undefined,
      } satisfies Facility
    })
    .filter(Boolean)
    .sort((a, b) => (a!.distance ?? 0) - (b!.distance ?? 0)) as Facility[]
}

function normalizeFacilityType(types: string[]): Facility['type'] {
  if (types.includes('hospital')) return 'general_hospital'
  if (types.includes('pharmacy')) return 'pharmacy'
  if (types.includes('doctor') || types.includes('health')) return 'clinic'
  return 'emergency'
}

type ApiFallbackFacility = {
  id: string
  name: string
  type: string
  address: string
  phone?: string
  location?: { lat: number; lng: number }
  latitude?: number
  longitude?: number
  rating?: number
  is24Hours?: boolean
  hasEmergency?: boolean
  services?: string[]
  state?: string
  lga?: string
}

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function getMetersBetween(
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral
) {
  const radius = 6371e3
  const originLat = (origin.lat * Math.PI) / 180
  const destinationLat = (destination.lat * Math.PI) / 180
  const deltaLat = ((destination.lat - origin.lat) * Math.PI) / 180
  const deltaLng = ((destination.lng - origin.lng) * Math.PI) / 180
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(originLat) *
      Math.cos(destinationLat) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return radius * c
}

declare global {
  interface Window {
    google: typeof google
  }
}
