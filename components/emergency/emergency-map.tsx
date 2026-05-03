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

// Sample nearby facilities (in production, this would come from API)
const SAMPLE_FACILITIES: Facility[] = [
  {
    id: '1',
    name: 'Lagos University Teaching Hospital',
    type: 'teaching_hospital',
    address: 'Idi-Araba, Surulere, Lagos',
    state: 'Lagos',
    lga: 'Surulere',
    latitude: 6.5177,
    longitude: 3.3516,
    phone: '+234 1 585 2076',
    services: ['Emergency', 'Surgery', 'ICU', 'Pediatrics'],
    hasEmergency: true,
    isOpen24Hours: true,
    averageRating: 4.2,
    totalRatings: 1250,
    isVerified: true,
  },
  {
    id: '2',
    name: 'Lagos State Emergency Medical Services',
    type: 'emergency',
    address: 'Lagos Island, Lagos',
    state: 'Lagos',
    lga: 'Lagos Island',
    latitude: 6.4541,
    longitude: 3.3947,
    phone: '767',
    services: ['Emergency', 'Ambulance', 'Trauma'],
    hasEmergency: true,
    isOpen24Hours: true,
    averageRating: 4.5,
    totalRatings: 890,
    isVerified: true,
  },
  {
    id: '3',
    name: 'First Consultants Medical Centre',
    type: 'private_hospital',
    address: 'Obalende, Lagos',
    state: 'Lagos',
    lga: 'Lagos Island',
    latitude: 6.4433,
    longitude: 3.4127,
    phone: '+234 1 461 3080',
    services: ['Emergency', 'Cardiology', 'Diagnostics'],
    hasEmergency: true,
    isOpen24Hours: true,
    averageRating: 4.6,
    totalRatings: 450,
    isVerified: true,
  },
]

interface EmergencyMapProps {
  onFacilitySelected?: (facility: Facility) => void
}

export function EmergencyMap({ onFacilitySelected }: EmergencyMapProps) {
  const {
    currentLocation,
    destination,
    eta,
    distance,
    setLocation,
    setDestination,
    updateJourney,
  } = useEmergencyStore()

  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [nearbyFacilities, setNearbyFacilities] = useState<Facility[]>([])
  const [isNavigating, setIsNavigating] = useState(false)

  // Get user location
  const fetchLocation = useCallback(async () => {
    setIsLoadingLocation(true)
    setLocationError(null)

    try {
      const coords = await getCurrentLocation()
      setLocation(coords)

      // Calculate distances for facilities
      const facilitiesWithDistance = SAMPLE_FACILITIES.map((f) => ({
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
  }, [setLocation, destination])

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

    // Open in new tab/app
    window.open(link, '_blank')
    setIsNavigating(true)

    // Simulate journey progress
    if (destination.eta) {
      const totalTime = destination.eta * 60 * 1000 // Convert to ms
      const interval = 5000 // Update every 5 seconds
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

  // Fetch location on mount
  useEffect(() => {
    fetchLocation()
  }, [fetchLocation])

  return (
    <div className="flex flex-col gap-4">
      {/* Map Placeholder */}
      <div className="relative w-full h-48 sm:h-64 bg-secondary rounded-xl overflow-hidden">
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
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Map view loading...
              </p>
              {currentLocation && (
                <p className="text-xs text-muted-foreground mt-1">
                  {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                </p>
              )}
            </div>
          </div>
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
                    {facility.eta} min
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
