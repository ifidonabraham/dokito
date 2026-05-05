"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFacilitiesStore } from "@/stores/facilities-store";
import type { Facility } from "@/lib/types";

interface FacilityMapProps {
  facilities: Facility[];
}

export function FacilityMap({ facilities }: FacilityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  
  const { userLocation, selectedFacility, setSelectedFacility } = useFacilitiesStore();

  useEffect(() => {
    // Check if Google Maps API is available
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setMapError("Google Maps API key not configured");
      return;
    }

    // Load Google Maps Script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setMapLoaded(true);
    };
    
    script.onerror = () => {
      setMapError("Failed to load Google Maps");
    };

    // Check if already loaded
    if (window.google?.maps) {
      setMapLoaded(true);
    } else {
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google?.maps) return;

    const center = userLocation || { lat: 6.5244, lng: 3.3792 }; // Default to Lagos

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // User location marker
    if (userLocation) {
      new window.google.maps.Marker({
        position: userLocation,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#3B82F6",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
        title: "Your Location",
      });
    }

    // Facility markers
    facilities.forEach((facility) => {
      const marker = new window.google.maps.Marker({
        position: { lat: facility.latitude, lng: facility.longitude },
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: facility.hasEmergency ? "#EF4444" : "#22C55E",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: facility.name,
      });

      marker.addListener("click", () => {
        setSelectedFacility(facility);
      });
    });

    // Pan to selected facility
    if (selectedFacility) {
      map.panTo({ lat: selectedFacility.latitude, lng: selectedFacility.longitude });
      map.setZoom(15);
    }
  }, [mapLoaded, facilities, userLocation, selectedFacility, setSelectedFacility]);

  if (mapError) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-muted p-8 text-center">
        <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 font-semibold text-foreground">Map API not available</h3>
        <p className="mb-4 text-sm text-muted-foreground">{mapError}</p>
        <p className="text-xs text-muted-foreground">
          The in-platform map needs a working Google Maps API key.
        </p>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-muted">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 rounded-lg border border-border bg-card p-3 shadow-lg">
        <h4 className="mb-2 text-xs font-medium text-foreground">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-xs text-muted-foreground">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Healthcare Facility</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">Emergency Services</span>
          </div>
        </div>
      </div>

      {/* Selected Facility Card */}
      {selectedFacility && (
        <div className="absolute bottom-4 right-4 w-64 rounded-lg border border-border bg-card p-4 shadow-lg">
          <h3 className="font-semibold text-foreground">{selectedFacility.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{selectedFacility.address}</p>
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              className="flex-1 gap-1"
              onClick={() => {
                mapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              <Navigation className="h-3 w-3" />
              Route Shown
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Add Google Maps types
declare global {
  interface Window {
    google: typeof google;
  }
}
