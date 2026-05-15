"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  MapPin, 
  Search, 
  Filter, 
  Phone, 
  Clock, 
  Navigation,
  Star,
  Building2,
  Pill,
  Stethoscope,
  AlertTriangle,
  X,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Facility {
  id: string;
  name: string;
  type: string;
  address: string;
  phone?: string;
  location: { lat: number; lng: number };
  rating?: number;
  userRatingsTotal?: number;
  isOpen?: boolean;
  distance?: string;
  estimatedTime?: string;
  placeId: string;
  isSampleData?: boolean;
}

type FacilityType = "all" | "hospital" | "pharmacy" | "clinic";

const FACILITY_TYPES: { type: FacilityType; label: string; icon: typeof MapPin; query: string }[] = [
  { type: "all", label: "All", icon: MapPin, query: "hospital|pharmacy|clinic" },
  { type: "hospital", label: "Hospitals", icon: Building2, query: "hospital" },
  { type: "pharmacy", label: "Pharmacies", icon: Pill, query: "pharmacy" },
  { type: "clinic", label: "Clinics", icon: Stethoscope, query: "clinic|medical center" },
];

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [facilityType, setFacilityType] = useState<FacilityType>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const [is24Hours, setIs24Hours] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [routeFacility, setRouteFacility] = useState<Facility | null>(null);
  const [isSampleData, setIsSampleData] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const defaultLoc = { lat: 6.5244, lng: 3.3792 };

    const resolveLocation = (onLocation: (location: { lat: number; lng: number }) => void) => {
      if (!navigator.geolocation) {
        onLocation(defaultLoc);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => onLocation(defaultLoc)
      );
    };

    if (!apiKey) {
      setMapsError("Google Maps API key is not configured");
      resolveLocation((location) => {
        setUserLocation(location);
        searchFallbackFacilities(location, facilityType);
      });
      return;
    }

    if (window.google?.maps?.places) {
      resolveLocation((location) => {
        setUserLocation(location);
        initializeMap(location);
      });
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolveLocation((location) => {
        setUserLocation(location);
        initializeMap(location);
      });
    };
    script.onerror = () => {
      setMapsError("Google Maps failed to load");
      resolveLocation((location) => {
        setUserLocation(location);
        searchFallbackFacilities(location, facilityType);
      });
    };

    if (existingScript) {
      existingScript.addEventListener("load", script.onload);
      existingScript.addEventListener("error", script.onerror);
    } else {
      document.head.appendChild(script);
    }
  }, []);

  const initializeMap = (location: { lat: number; lng: number }) => {
    const mapDiv = document.createElement("div");
    mapDiv.style.display = "none";
    document.body.appendChild(mapDiv);

    const mapInstance = new google.maps.Map(mapDiv, {
      center: location,
      zoom: 14,
    });
    setMap(mapInstance);

    const service = new google.maps.places.PlacesService(mapInstance);
    setPlacesService(service);
  };

  const getPlaceOpenStatus = (place: google.maps.places.PlaceResult): boolean | undefined => {
    const openingHours = place.opening_hours as
      | { isOpen?: unknown; open_now?: boolean }
      | undefined;

    if (!openingHours) return undefined;
    if (typeof openingHours.isOpen === "function") {
      try {
        return openingHours.isOpen();
      } catch {
        return openingHours.open_now;
      }
    }
    return openingHours.open_now;
  };

  const searchFallbackFacilities = useCallback(async (
    location: { lat: number; lng: number },
    type: FacilityType
  ) => {
    setIsLoading(true);
    const params = new URLSearchParams({
      lat: String(location.lat),
      lng: String(location.lng),
      type,
    });

    const response = await fetch(`/api/facilities?${params.toString()}`);
    const data = await response.json();
    const fallbackFacilities: Facility[] = (data.facilities || []).map((facility: {
      id: string;
      name: string;
      type: string;
      address: string;
      phone?: string;
      location: { lat: number; lng: number };
      rating?: number;
      is24Hours?: boolean;
      distance?: string;
      estimatedTime?: string;
      isSampleData?: boolean;
    }) => ({
      id: facility.id,
      name: facility.name,
      type: facility.type,
      address: facility.address,
      phone: facility.phone,
      location: facility.location,
      rating: facility.rating,
      isOpen: facility.is24Hours,
      distance: facility.distance,
      estimatedTime: facility.estimatedTime,
      placeId: facility.id,
      isSampleData: facility.isSampleData,
    }));

    setIsSampleData(Boolean(data.sampleData));
    setFacilities(fallbackFacilities);
    setIsLoading(false);
  }, []);

  // Search for facilities
  const searchFacilities = useCallback((type: FacilityType) => {
    if (!userLocation) return;
    if (!placesService || mapsError) {
      searchFallbackFacilities(userLocation, type);
      return;
    }

    setIsLoading(true);
    const typeConfig = FACILITY_TYPES.find(t => t.type === type) || FACILITY_TYPES[0];
    
    const request: google.maps.places.TextSearchRequest = {
      query: typeConfig.query + " near me",
      location: new google.maps.LatLng(userLocation.lat, userLocation.lng),
      radius: 5000,
    };

    placesService.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        setIsSampleData(false);
        const facilitiesData: Facility[] = results.map((place) => {
          // Calculate distance
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            place.geometry?.location?.lat() || 0,
            place.geometry?.location?.lng() || 0
          );

          // Determine facility type
          let facilityTypeResult: "hospital" | "pharmacy" | "clinic" = "clinic";
          const name = place.name?.toLowerCase() || "";
          const types = place.types || [];
          
          if (types.includes("hospital") || name.includes("hospital") || name.includes("teaching hospital")) {
            facilityTypeResult = "hospital";
          } else if (types.includes("pharmacy") || name.includes("pharmacy") || name.includes("chemist")) {
            facilityTypeResult = "pharmacy";
          }

          return {
            id: place.place_id || String(Math.random()),
            name: place.name || "Unknown Facility",
            type: facilityTypeResult,
            address: place.formatted_address || place.vicinity || "Address not available",
            location: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0,
            },
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
            isOpen: getPlaceOpenStatus(place),
            distance: `${distance.toFixed(1)} km`,
            estimatedTime: `${Math.ceil(distance * 3)} mins`,
            placeId: place.place_id || "",
          };
        });

        // Sort by distance
        facilitiesData.sort((a, b) => {
          const distA = parseFloat(a.distance?.replace(" km", "") || "0");
          const distB = parseFloat(b.distance?.replace(" km", "") || "0");
          return distA - distB;
        });

        setFacilities(facilitiesData);
      } else {
        setMapsError(`Google Places returned ${status}. Showing saved facility results instead.`);
        searchFallbackFacilities(userLocation, type);
        return;
      }
      setIsLoading(false);
    });
  }, [placesService, userLocation, mapsError, searchFallbackFacilities]);

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  // Search when places service is ready or type changes
  useEffect(() => {
    if (placesService && userLocation) {
      searchFacilities(facilityType);
    }
  }, [placesService, userLocation, facilityType, searchFacilities]);

  // Filter facilities
  const filteredFacilities = facilities.filter((facility) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!facility.name.toLowerCase().includes(query) && 
          !facility.address.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (is24Hours && !facility.isOpen) {
      return false;
    }
    return true;
  });

  const handleNavigate = (facility: Facility) => {
    setSelectedFacility(facility);
    setRouteFacility(facility);
    setShowMap(true);
  };

  const mapCenter = selectedFacility?.location || userLocation;
  const hasGoogleMapsKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  const handleCall = (facility: Facility) => {
    if (facility.phone) {
      window.location.href = `tel:${facility.phone}`;
      return;
    }

    // Get place details for phone number
    if (placesService && facility.placeId) {
      placesService.getDetails(
        { placeId: facility.placeId, fields: ["formatted_phone_number"] },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place?.formatted_phone_number) {
            window.location.href = `tel:${place.formatted_phone_number}`;
          } else {
            alert("Phone number not available for this facility");
          }
        }
      );
      return;
    }

    alert("Phone number not available for this facility");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "hospital": return <Building2 className="h-4 w-4 text-primary" />;
      case "pharmacy": return <Pill className="h-4 w-4 text-green-600" />;
      default: return <Stethoscope className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem-5rem)] flex-col lg:h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Find Healthcare</h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Searching..." : `${filteredFacilities.length} facilities near you`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => searchFacilities(facilityType)}
              disabled={isLoading}
              className="gap-1"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
            <Button
              variant={showMap ? "default" : "outline"}
              size="sm"
              onClick={() => setShowMap(!showMap)}
              className="gap-1"
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Map</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-1"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type Filters */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {FACILITY_TYPES.map(({ type, label, icon: Icon }) => (
            <Button
              key={type}
              variant={facilityType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFacilityType(type)}
              className="shrink-0 gap-1"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Additional Filters */}
        {showFilters && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
            <Button
              variant={is24Hours ? "default" : "outline"}
              size="sm"
              onClick={() => setIs24Hours(!is24Hours)}
              className="gap-1"
            >
              <Clock className="h-4 w-4" />
              Open Now
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Facility List */}
        <div className={cn(
          "flex-1 overflow-y-auto p-4",
          showMap && "hidden lg:block lg:w-1/2"
        )}>
          {mapsError && !isLoading && (
            <div className="mb-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
              {mapsError}. Showing saved facility results instead.
            </div>
          )}

          {isSampleData && !isLoading && (
            <div className="mb-3 rounded-lg border border-sky-500/30 bg-sky-500/10 p-3 text-sm text-sky-800 dark:text-sky-300">
              Sample facility data is loaded from Supabase seed rows. Replace it with verified facility data when available.
            </div>
          )}

          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
              <h3 className="font-semibold text-foreground">Finding facilities...</h3>
              <p className="text-sm text-muted-foreground">
                Searching for healthcare facilities near you
              </p>
            </div>
          ) : filteredFacilities.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">No facilities found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFacilities.map((facility) => (
                <Card
                  key={facility.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary",
                    selectedFacility?.id === facility.id && "border-primary ring-1 ring-primary"
                  )}
                  onClick={() => setSelectedFacility(facility)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(facility.type)}
                          <h3 className="font-semibold text-foreground">{facility.name}</h3>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          {facility.isOpen !== undefined && (
                            <span className={cn(
                              "rounded-full px-2 py-0.5 text-xs",
                              facility.isOpen 
                                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                            )}>
                              {facility.isOpen ? "Open" : "Closed"}
                            </span>
                          )}
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                            {facility.type}
                          </span>
                        </div>
                        <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="line-clamp-1">{facility.address}</span>
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        {facility.rating && (
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-medium">{facility.rating}</span>
                            {facility.userRatingsTotal && (
                              <span className="text-xs text-muted-foreground">
                                ({facility.userRatingsTotal})
                              </span>
                            )}
                          </div>
                        )}
                        {facility.distance && (
                          <p className="mt-1 text-sm font-medium text-foreground">
                            {facility.distance}
                          </p>
                        )}
                        {facility.estimatedTime && (
                          <p className="text-xs text-muted-foreground">
                            ~{facility.estimatedTime}
                          </p>
                        )}
                      </div>
                    </div>

                    {selectedFacility?.id === facility.id && (
                      <div className="mt-3 flex gap-2 border-t border-border pt-3">
                        <Button
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigate(facility);
                          }}
                        >
                          <Navigation className="h-4 w-4" />
                          Show Route
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCall(facility);
                          }}
                        >
                          <Phone className="h-4 w-4" />
                          Call
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Map View */}
        {showMap && (
          <div className="relative flex-1 lg:w-1/2">
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-4 z-10 lg:hidden"
              onClick={() => setShowMap(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div id="facility-map" className="h-full w-full">
              {!hasGoogleMapsKey ? (
                <div className="flex h-full flex-col items-center justify-center bg-muted p-6 text-center">
                  <AlertTriangle className="mb-3 h-10 w-10 text-amber-600" />
                  <h3 className="font-semibold text-foreground">Map API not available</h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Google Maps is not configured correctly, so the in-platform map cannot load.
                    Facility results are still shown in the list.
                  </p>
                </div>
              ) : routeFacility && userLocation ? (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&origin=${userLocation.lat},${userLocation.lng}&destination=${routeFacility.location.lat},${routeFacility.location.lng}&mode=driving`}
                />
              ) : mapCenter ? (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${facilityType === "all" ? "hospital+pharmacy" : facilityType}&center=${mapCenter.lat},${mapCenter.lng}&zoom=14`}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
                  Finding your location...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
