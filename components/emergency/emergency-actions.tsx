"use client";

import { Phone, Navigation, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEmergencyStore } from "@/stores/emergency-store";
import { formatDistance } from "@/lib/maps";

const EMERGENCY_NUMBERS = {
  ambulance: "112",
  police: "199",
  fire: "199",
  poison: "+234-1-7743500",
};

export function EmergencyActions() {
  const { emergencyType, nearestFacilities, destination, eta, distance, setActiveView } = useEmergencyStore();

  // Use the selected destination first, fall back to nearest facility from API
  const nearestFacility = destination ?? nearestFacilities[0] ?? null;

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const handleViewRoute = () => {
    setActiveView("map");
  };

  const handleShareLocation = async () => {
    if (!navigator.geolocation) {
      alert("Location sharing is not available on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const message = `EMERGENCY! I need help. My location: https://www.google.com/maps?q=${latitude},${longitude}`;

        try {
          if (navigator.share) {
            await navigator.share({
              title: "Emergency - Need Help",
              text: message,
            });
            return;
          }

          await navigator.clipboard.writeText(message);
          alert("Location copied. Share it with emergency contacts.");
        } catch {
          alert(message);
        }
      },
      () => {
        alert("Could not access your location. Call 112 or 199 immediately.");
      }
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">Quick Actions</h3>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="destructive"
          className="h-16 flex-col gap-1"
          onClick={() => handleCall(EMERGENCY_NUMBERS.ambulance)}
        >
          <Phone className="h-5 w-5" />
          <span className="text-xs">Call 112</span>
        </Button>

        <Button
          variant="outline"
          className="h-16 flex-col gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          onClick={handleViewRoute}
          disabled={!nearestFacility}
        >
          <Navigation className="h-5 w-5" />
          <span className="text-xs">View Route</span>
        </Button>

        <Button
          variant="outline"
          className="h-16 flex-col gap-1"
          onClick={() => setActiveView("voice")}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs">Voice Help</span>
        </Button>

        <Button
          variant="outline"
          className="h-16 flex-col gap-1"
          onClick={handleShareLocation}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs">Share Location</span>
        </Button>
      </div>

      {emergencyType && (
        <div className="rounded-lg bg-destructive/10 p-3">
          <p className="text-sm font-medium text-destructive">
            Emergency Type: {emergencyType.replace(/_/g, " ").toUpperCase()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Help is being coordinated. Stay calm and follow voice instructions.
          </p>
        </div>
      )}

      {nearestFacility && (
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-sm font-medium text-foreground">
            Nearest Facility
          </p>
          <p className="text-sm text-foreground">{nearestFacility.name}</p>
          <p className="text-xs text-muted-foreground">
            {distance != null ? `${formatDistance(distance)} away` : nearestFacility.distance != null ? formatDistance(nearestFacility.distance) : "Distance unknown"}
            {eta != null ? ` - ${eta} min` : nearestFacility.eta != null ? ` - ${nearestFacility.eta} min` : ""}
          </p>
          {nearestFacility.phone && (
            <Button
              variant="link"
              size="sm"
              className="mt-1 h-auto p-0 text-primary"
              onClick={() => handleCall(nearestFacility.phone!)}
            >
              <Phone className="mr-1 h-3 w-3" />
              Call Facility
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
