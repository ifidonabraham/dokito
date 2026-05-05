'use client'

import { useEffect, useState, useCallback } from 'react'
import { Navigation, MapPin, Clock, Route, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useEmergencyStore } from '@/stores/emergency-store'
import {
  getCurrentLocation,
  getNavigationLink,
  formatDistance,
  estimateTravelTime,
  calculateDistance,
} from '@/lib/maps'
import type { Facility } from '@/lib/types'

interface EmergencyMapProps {
  onFacilitySelected?: (facility: Facility) => void
}

type ApiFacility = Omit<Partial<Facility>, 'distance' | 'eta'> & {
  id: string
  name: string
  type: string
  address: string
  phone?: string
  location?: { lat: number; lng: number }
  latitude?: number
  longitude?: number
  rating?: number
  averageRating?: number
  is24Hours?: boolean
  isOpen24Hours?: boolean
  hasEmergency: boolean
  services?: string[]
  state?: string
  lga?: string
  distance?: string | number
  estimatedTime?: string
}

export function EmergencyMap({ onFacilitySelected }: EmergencyMapProps) {
  const {
    currentLocation,
    destination,
    eta,
    distance,
    setCurrentLocation,
    setDestination,
    updateJourney,
  } = useEmergencyStore()

  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [nearbyFacilities, setNearbyFacilities] = useState<Facility[]>([])
  const [isNavigating, setIsNavigating] = useState(false)

  // Get user location and fetch nearby emergency facilities
  const fetchLocation = useCallback(async () => {
    setIsLoadingLocation(true)
    setLocationError(null)

    try {
      const coords = await getCurrentLocation()
      setCurrentLocation(coords)

      // Fetch real facilities from API
      let facilities: Facility[] = []
      try {
        const res = await fetch(
          `/api/facilities?lat=${coords.latitude}&lng=${coords.longitude}&hasEmergency=true&limit=5`
        )
        const data = await res.json()
        facilities = (data.facilities || []).map(normalizeFacility).filter(Boolean) as Facility[]
      } catch {
        // API unavailable; fall back to empty list
      }

      // Attach computed distance/eta to each facility
      const facilitiesWithDistance = facilities.map((f) => ({
        ...f,
        distance: calculateDistance(
          coords.latitude,
          coords.longitude,
          f.latitude,
          f.longitude
        ),
        eta: estimateTravelTime(
          calculateDistance(
            coords.latitude,
            coords.longitude,
            f.latitude,
            f.longitude
          )
        ),
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0))

      setNearbyFacilities(facilitiesWithDistance)

      // Auto-select nearest emergency facility
      const nearest = facilitiesWithDistance.find((f) => f.hasEmergency)
      if (nearest && !destination) {
        selectFacility(nearest)
      }
    } catch (error) {
      setLocationError(
        error instanceof Error ? error.message : 'Failed to get location'
      )
    } finally {
      setIsLoadingLocation(false)
    }
  }, [setCurrentLocation, destination])

  // Select a facility as destination
  const selectFacility = useCallback(
    (facility: Facility) => {
      setDestination(facility)
      if (facility.distance !== undefined && facility.eta !== undefined) {
        updateJourney(facility.eta, facility.distance, 0)
      }
      onFacilitySelected?.(facility)
    },
    [setDestination, updateJourney, onFacilitySelected]
  )

  // Start navigation
  const startNavigation = useCallback(() => {
    if (!destination) return

    const link = getNavigationLink({
      latitude: destination.latitude,
      longitude: destination.longitude,
    })

    window.open(link, '_blank')
    setIsNavigating(true)

    // Simulate journey progress
    if (destination.eta) {
      const totalTime = destination.eta * 60 * 1000
      const interval = 5000
      let elapsed = 0

      const progressInterval = setInterval(() => {
        elapsed += interval
        const progress = Math.min((elapsed / totalTime) * 100, 100)
        const remainingEta = Math.max(
          Math.ceil(((totalTime - elapsed) / 1000 / 60)),
          0
        )
        const remainingDistance = destination.distance
          ? Math.max(destination.distance * (1 - progress / 100), 0)
          : 0

        updateJourney(remainingEta, remainingDistance, progress)

        if (progress >= 100) {
          clearInterval(progressInterval)
        }
      }, interval)
    }
  }, [destination, updateJourney])

  useEffect(() => {
    fetchLocation()
  }, [fetchLocation])

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-56 w-full overflow-hidden rounded-xl border border-primary/20 bg-secondary sm:h-72">
        {isLoadingLocation ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            <span className="ml-2 text-muted-foreground">Finding your location...</span>
          </div>
        ) : locationError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <MapPin className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-destructive text-center">{locationError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLocation}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {currentLocation && (
              <iframe
                title="Emergency map"
                src={buildOpenStreetMapUrl(
                  destination?.latitude ?? currentLocation.latitude,
                  destination?.longitude ?? currentLocation.longitude
                )}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
            <div className="absolute left-3 top-3 rounded-lg bg-background/95 px-3 py-2 text-xs shadow-sm">
              <p className="font-semibold text-foreground">
                {destination ? 'Nearest emergency care selected' : 'Your area'}
              </p>
              <p className="text-muted-foreground">
                Tap Go Now for Google Maps directions.
              </p>
            </div>
          </>
        )}

        {/* Journey Progress Overlay */}
        {destination && isNavigating && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">{eta} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-primary" />
                <span>{distance ? formatDistance(distance) : '--'}</span>
              </div>
            </div>
            <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${useEmergencyStore.getState().routeProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Selected Destination */}
      {destination && (
        <Card className="p-4 border-primary/30 bg-primary/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {destination.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {destination.address}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                {eta !== null && (
                  <span className="flex items-center gap-1 text-primary font-medium">
                    <Clock className="h-4 w-4" />
                    {eta} min
                  </span>
                )}
                {distance !== null && (
                  <span className="text-muted-foreground">
                    {formatDistance(distance)}
                  </span>
                )}
              </div>
            </div>
            <Button
              onClick={startNavigation}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Navigation className="h-4 w-4" />
              Go Now
            </Button>
          </div>
        </Card>
      )}

      {/* Nearby Facilities List */}
      {!destination && nearbyFacilities.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Nearby Emergency Facilities
          </h3>
          {nearbyFacilities.slice(0, 3).map((facility) => (
            <Card
              key={facility.id}
              className="p-3 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => selectFacility(facility)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{facility.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {facility.address}
                  </p>
                </div>
                <div className="flex flex-col items-end text-xs">
                  <span className="font-medium text-primary">
                    {facility.eta ?? '--'} min
                  </span>
                  <span className="text-muted-foreground">
                    {facility.distance ? formatDistance(facility.distance) : '--'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function normalizeFacility(facility: ApiFacility): Facility | null {
  const latitude = facility.latitude ?? facility.location?.lat
  const longitude = facility.longitude ?? facility.location?.lng

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null
  }

  return {
    id: facility.id,
    name: facility.name,
    type: normalizeFacilityType(facility.type),
    address: facility.address,
    state: facility.state ?? 'Lagos',
    lga: facility.lga ?? '',
    latitude,
    longitude,
    phone: facility.phone,
    services: facility.services ?? [],
    hasEmergency: Boolean(facility.hasEmergency),
    isOpen24Hours: Boolean(facility.isOpen24Hours ?? facility.is24Hours),
    averageRating: facility.averageRating ?? facility.rating ?? 0,
    totalRatings: 0,
    isVerified: true,
  }
}

function normalizeFacilityType(type: string): Facility['type'] {
  if (type === 'hospital') return 'general_hospital'
  if (type === 'clinic') return 'clinic'
  if (type === 'pharmacy') return 'pharmacy'
  if (type === 'laboratory') return 'laboratory'
  return 'emergency'
}

function buildOpenStreetMapUrl(latitude: number, longitude: number) {
  const latPad = 0.025
  const lngPad = 0.035
  const bbox = [
    longitude - lngPad,
    latitude - latPad,
    longitude + lngPad,
    latitude + latPad,
  ].join('%2C')

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`
}
