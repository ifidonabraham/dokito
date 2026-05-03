"use client";

import { useEffect, useState } from "react";
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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useFacilitiesStore } from "@/stores/facilities-store";
import { FacilityMap } from "@/components/facilities/facility-map";
import type { FacilityType, HealthFacility } from "@/lib/types";
import { cn } from "@/lib/utils";

const FACILITY_TYPES: { type: FacilityType | "all"; label: string; icon: typeof MapPin }[] = [
  { type: "all", label: "All", icon: MapPin },
  { type: "hospital", label: "Hospitals", icon: Building2 },
  { type: "pharmacy", label: "Pharmacies", icon: Pill },
  { type: "clinic", label: "Clinics", icon: Stethoscope },
];

// Mock facilities data for Nigeria
const MOCK_FACILITIES: HealthFacility[] = [
  {
    id: "1",
    name: "Lagos University Teaching Hospital",
    type: "hospital",
    address: "Idi-Araba, Lagos",
    phone: "+234 1 234 5678",
    location: { lat: 6.5166, lng: 3.3584 },
    rating: 4.2,
    is24Hours: true,
    hasEmergency: true,
    services: ["Emergency", "Surgery", "Pediatrics", "Maternity"],
    distance: "2.3 km",
    estimatedTime: "8 mins",
  },
  {
    id: "2",
    name: "Reddington Hospital",
    type: "hospital",
    address: "12, Idowu Martins Street, Victoria Island",
    phone: "+234 1 280 7100",
    location: { lat: 6.4281, lng: 3.4219 },
    rating: 4.5,
    is24Hours: true,
    hasEmergency: true,
    services: ["Emergency", "Diagnostics", "Surgery", "ICU"],
    distance: "5.1 km",
    estimatedTime: "15 mins",
  },
  {
    id: "3",
    name: "HealthPlus Pharmacy",
    type: "pharmacy",
    address: "Lekki Phase 1, Lagos",
    phone: "+234 812 345 6789",
    location: { lat: 6.4410, lng: 3.4765 },
    rating: 4.0,
    is24Hours: false,
    hasEmergency: false,
    services: ["Prescriptions", "OTC Drugs", "Health Products"],
    distance: "3.2 km",
    estimatedTime: "10 mins",
  },
  {
    id: "4",
    name: "MedPlus Pharmacy",
    type: "pharmacy",
    address: "Allen Avenue, Ikeja",
    phone: "+234 809 876 5432",
    location: { lat: 6.5975, lng: 3.3463 },
    rating: 4.3,
    is24Hours: true,
    hasEmergency: false,
    services: ["Prescriptions", "24hr Service", "Delivery"],
    distance: "4.8 km",
    estimatedTime: "12 mins",
  },
  {
    id: "5",
    name: "St. Nicholas Hospital",
    type: "hospital",
    address: "57 Campbell Street, Lagos Island",
    phone: "+234 1 263 0091",
    location: { lat: 6.4531, lng: 3.3958 },
    rating: 4.4,
    is24Hours: true,
    hasEmergency: true,
    services: ["Emergency", "Cardiology", "Orthopedics", "Dialysis"],
    distance: "3.7 km",
    estimatedTime: "11 mins",
  },
  {
    id: "6",
    name: "First Consultants Medical Centre",
    type: "clinic",
    address: "Opebi Road, Ikeja",
    phone: "+234 1 774 5030",
    location: { lat: 6.5891, lng: 3.3569 },
    rating: 4.1,
    is24Hours: false,
    hasEmergency: false,
    services: ["General Practice", "Lab Tests", "Vaccinations"],
    distance: "5.5 km",
    estimatedTime: "18 mins",
  },
];

export default function FacilitiesPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  const {
    facilities,
    selectedFacility,
    filters,
    setFacilities,
    setSelectedFacility,
    setFilters,
    setUserLocation,
    getFilteredFacilities,
  } = useFacilitiesStore();

  // Initialize with mock data
  useEffect(() => {
    setFacilities(MOCK_FACILITIES);
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to Lagos
          setUserLocation({ lat: 6.5244, lng: 3.3792 });
        }
      );
    }
  }, [setFacilities, setUserLocation]);

  const filteredFacilities = getFilteredFacilities();

  const handleNavigate = (facility: HealthFacility) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.location.lat},${facility.location.lng}&travelmode=driving`;
    window.open(url, "_blank");
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem-5rem)] flex-col lg:h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Find Healthcare</h1>
            <p className="text-sm text-muted-foreground">
              {filteredFacilities.length} facilities near you
            </p>
          </div>
          <div className="flex gap-2">
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
            placeholder="Search by name, address, or service..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            className="pl-9"
          />
        </div>

        {/* Type Filters */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {FACILITY_TYPES.map(({ type, label, icon: Icon }) => (
            <Button
              key={type}
              variant={filters.type === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ type })}
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
              variant={filters.is24Hours === true ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ is24Hours: filters.is24Hours === true ? null : true })}
              className="gap-1"
            >
              <Clock className="h-4 w-4" />
              24 Hours
            </Button>
            <Button
              variant={filters.hasEmergency === true ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ hasEmergency: filters.hasEmergency === true ? null : true })}
              className="gap-1"
            >
              <AlertTriangle className="h-4 w-4" />
              Emergency
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
          {filteredFacilities.length === 0 ? (
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
                          <h3 className="font-semibold text-foreground">{facility.name}</h3>
                          {facility.is24Hours && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-400">
                              24hrs
                            </span>
                          )}
                          {facility.hasEmergency && (
                            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                              ER
                            </span>
                          )}
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {facility.address}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {facility.services.slice(0, 3).map((service) => (
                            <span
                              key={service}
                              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        {facility.rating && (
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-medium">{facility.rating}</span>
                          </div>
                        )}
                        {facility.distance && (
                          <p className="mt-1 text-sm text-muted-foreground">
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
                          Navigate
                        </Button>
                        {facility.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCall(facility.phone!);
                            }}
                          >
                            <Phone className="h-4 w-4" />
                            Call
                          </Button>
                        )}
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
            <FacilityMap facilities={filteredFacilities} />
          </div>
        )}
      </div>
    </div>
  );
}
