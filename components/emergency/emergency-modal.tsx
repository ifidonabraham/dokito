"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  ShieldAlert,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEmergencyStore } from "@/stores/emergency-store";
import type { Facility } from "@/lib/types";

type EmergencyStatus = "idle" | "locating" | "loading_facilities" | "success" | "location_denied" | "error";

type ApiFacility = {
  id: string;
  name: string;
  type: string;
  address: string;
  phone?: string;
  location?: { lat: number; lng: number };
  latitude?: number;
  longitude?: number;
  rating?: number;
  is24Hours?: boolean;
  hasEmergency?: boolean;
  services?: string[];
  state?: string;
  lga?: string;
  distance?: string;
  estimatedTime?: string;
  distanceValue?: number;
};

export function EmergencyModal() {
  const {
    isEmergencyMode,
    userLocation,
    nearestFacilities,
    deactivateEmergency,
    setUserLocation,
    setNearestFacilities,
  } = useEmergencyStore();
  const [status, setStatus] = useState<EmergencyStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isEmergencyMode) return;

    document.body.style.overflow = "hidden";
    startEmergencyWorkflow();

    return () => {
      document.body.style.overflow = "";
    };
    // startEmergencyWorkflow intentionally runs only when emergency mode opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEmergencyMode]);

  const nearestFacility = nearestFacilities[0] ?? null;

  const emergencyInstruction = useMemo(() => {
    if (status === "location_denied") {
      return "Call 112 or 199 now if this is urgent. Location access is needed to find the nearest hospital automatically.";
    }

    if (status === "success" && nearestFacility) {
      return "Call emergency services first if the situation is critical. Then contact or go to the nearest facility shown below.";
    }

    return "Stay calm. Move away from danger if possible. Do not wait for the app before calling emergency services.";
  }, [nearestFacility, status]);

  if (!isEmergencyMode) return null;

  async function startEmergencyWorkflow() {
    setMessage(null);
    setNearestFacilities([]);

    if (!navigator.geolocation) {
      setStatus("location_denied");
      setMessage("This browser cannot access your location.");
      return;
    }

    setStatus("locating");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(location);
        setStatus("loading_facilities");

        try {
          const facilities = await loadEmergencyFacilities(location);
          setNearestFacilities(facilities.map(toStoreFacility));
          setStatus(facilities.length > 0 ? "success" : "error");

          if (facilities.length === 0) {
            setMessage("No emergency facilities were returned. Call 112 or 199 immediately.");
          }
        } catch (error) {
          setStatus("error");
          setMessage(error instanceof Error ? error.message : "Could not load nearby facilities.");
        }
      },
      () => {
        setStatus("location_denied");
        setMessage("Location permission was not granted.");
      },
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 }
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background">
      <header className="flex h-[3.75rem] items-center justify-between border-b border-red-700 bg-red-600 px-4 text-white">
        <div className="flex min-w-0 items-center gap-2">
          <AlertTriangle className="h-5 w-5 shrink-0 animate-pulse" />
          <span className="truncate font-bold">Emergency Mode</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="secondary" className="rounded-xl">
            <a href="tel:112">
              <Phone className="mr-2 h-4 w-4" />
              112
            </a>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-xl text-white hover:bg-white/15 hover:text-white"
            onClick={deactivateEmergency}
            aria-label="Exit emergency mode"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="h-[calc(100vh-3.75rem)] overflow-y-auto px-4 py-4 pb-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 lg:grid lg:grid-cols-[1fr_360px]">
          <section className="space-y-4">
            <Card className="border-red-200 bg-red-50 text-red-950 dark:border-red-950 dark:bg-red-950/30 dark:text-red-50">
              <CardContent className="p-4 sm:p-5">
                <div className="flex gap-3">
                  <ShieldAlert className="mt-1 h-6 w-6 shrink-0 text-red-600 dark:text-red-200" />
                  <div>
                    <h1 className="text-xl font-bold">Get help now</h1>
                    <p className="mt-2 text-sm leading-6">{emergencyInstruction}</p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <Button asChild variant="destructive" className="h-12 rounded-xl">
                        <a href="tel:112">
                          <Phone className="mr-2 h-4 w-4" />
                          Call 112
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="h-12 rounded-xl border-red-300 bg-white text-red-700 hover:bg-red-100">
                        <a href="tel:199">
                          <Phone className="mr-2 h-4 w-4" />
                          Call 199
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">Nearest emergency facilities</h2>
                    <p className="text-sm text-muted-foreground">
                      {userLocation
                        ? `Using your location: ${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`
                        : "Waiting for location permission"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={startEmergencyWorkflow} className="rounded-xl">
                    Retry
                  </Button>
                </div>

                {(status === "locating" || status === "loading_facilities") && (
                  <div className="rounded-2xl border bg-secondary/50 p-5 text-center">
                    <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
                    <p className="font-medium">
                      {status === "locating" ? "Finding your location..." : "Finding nearby emergency care..."}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">Call 112 immediately if the situation is critical.</p>
                  </div>
                )}

                {(status === "location_denied" || status === "error") && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                    <p className="font-medium">{message || "Could not find your nearest facility."}</p>
                    <p className="mt-2 text-sm">
                      Allow location access to find the nearest hospital. You can still call emergency numbers or open Facility Finder.
                    </p>
                    <Button asChild variant="outline" className="mt-3 rounded-xl bg-white">
                      <a href="/facilities">Find facilities manually</a>
                    </Button>
                  </div>
                )}

                {status === "success" && nearestFacilities.length > 0 && (
                  <div className="space-y-3">
                    {nearestFacilities.map((facility, index) => (
                      <FacilityEmergencyCard key={facility.id} facility={facility} index={index} userLocation={userLocation} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h2 className="font-semibold">Calm steps</h2>
                <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <li>1. Call 112 or 199 if anyone may die or worsen quickly.</li>
                  <li>2. Keep the person still and away from danger.</li>
                  <li>3. Do not give food, drink, or medicine unless a clinician says so.</li>
                  <li>4. Go to the nearest emergency facility if it is safe to move.</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h2 className="font-semibold">Emergency numbers</h2>
                <div className="mt-3 grid gap-2">
                  <Button asChild variant="destructive" className="rounded-xl">
                    <a href="tel:112">Call 112</a>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl">
                    <a href="tel:199">Call 199</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

function FacilityEmergencyCard({
  facility,
  index,
  userLocation,
}: {
  facility: Facility;
  index: number;
  userLocation: { lat: number; lng: number } | null;
}) {
  const directionsUrl = buildDirectionsUrl(userLocation, facility);

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {index === 0 ? "Nearest facility" : `Option ${index + 1}`}
          </p>
          <h3 className="mt-1 font-semibold text-foreground">{facility.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{facility.address}</p>
        </div>
        <MapPin className="h-5 w-5 shrink-0 text-primary" />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {facility.distance != null && (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
            <Navigation className="h-3.5 w-3.5" />
            {(facility.distance / 1000).toFixed(1)} km
          </span>
        )}
        {facility.eta != null && (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
            <Clock className="h-3.5 w-3.5" />
            {facility.eta} min
          </span>
        )}
        {facility.isOpen24Hours && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">24 hours</span>}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {facility.phone && (
          <Button asChild variant="outline" className="rounded-xl">
            <a href={`tel:${facility.phone}`}>
              <Phone className="mr-2 h-4 w-4" />
              Call
            </a>
          </Button>
        )}
        <Button asChild className="rounded-xl">
          <a href={directionsUrl} target="_blank" rel="noreferrer">
            <Navigation className="mr-2 h-4 w-4" />
            Directions
          </a>
        </Button>
      </div>
    </div>
  );
}

async function loadEmergencyFacilities(location: { lat: number; lng: number }) {
  const params = new URLSearchParams({
    hasEmergency: "true",
    lat: String(location.lat),
    lng: String(location.lng),
    limit: "5",
  });

  const response = await fetch(`/api/facilities?${params.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Could not load emergency facilities.");
  }

  return (data.facilities || []) as ApiFacility[];
}

function toStoreFacility(facility: ApiFacility): Facility {
  const latitude = facility.latitude ?? facility.location?.lat ?? 0;
  const longitude = facility.longitude ?? facility.location?.lng ?? 0;

  return {
    id: facility.id,
    name: facility.name,
    type: normalizeFacilityType(facility.type),
    address: facility.address,
    state: facility.state || "",
    lga: facility.lga || "",
    latitude,
    longitude,
    phone: facility.phone,
    services: facility.services || [],
    hasEmergency: Boolean(facility.hasEmergency),
    isOpen24Hours: Boolean(facility.is24Hours),
    averageRating: facility.rating || 0,
    totalRatings: 0,
    isVerified: true,
    distance: typeof facility.distanceValue === "number" ? facility.distanceValue * 1000 : undefined,
    eta: parseEta(facility.estimatedTime),
  };
}

function normalizeFacilityType(type: string): Facility["type"] {
  if (type === "hospital") return "general_hospital";
  if (type === "pharmacy") return "pharmacy";
  if (type === "clinic") return "clinic";
  if (type === "teaching_hospital") return "teaching_hospital";
  if (type === "private_hospital") return "private_hospital";
  if (type === "phc") return "phc";
  if (type === "laboratory") return "laboratory";
  return "emergency";
}

function parseEta(value?: string) {
  if (!value) return undefined;
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : undefined;
}

function buildDirectionsUrl(userLocation: { lat: number; lng: number } | null, facility: Facility) {
  const params = new URLSearchParams({
    api: "1",
    destination: `${facility.latitude},${facility.longitude}`,
    travelmode: "driving",
  });

  if (userLocation) {
    params.set("origin", `${userLocation.lat},${userLocation.lng}`);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
