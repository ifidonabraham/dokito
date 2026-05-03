"use client";

import { useEffect } from "react";
import { X, MapPin, Mic, AlertTriangle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEmergencyStore } from "@/stores/emergency-store";
import { EmergencyMap } from "./emergency-map";
import { EmergencyVoiceAssistant } from "./emergency-voice-assistant";
import { EmergencyActions } from "./emergency-actions";
import { cn } from "@/lib/utils";

export function EmergencyModal() {
  const {
    isEmergencyMode,
    activeView,
    setActiveView,
    deactivateEmergency,
    setUserLocation,
    findNearestFacilities,
  } = useEmergencyStore();

  useEffect(() => {
    if (isEmergencyMode) {
      // Get user location immediately
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(location);
            findNearestFacilities(location);
          },
          (error) => {
            console.error("Location error:", error);
            // Default to Lagos coordinates
            const defaultLocation = { lat: 6.5244, lng: 3.3792 };
            setUserLocation(defaultLocation);
            findNearestFacilities(defaultLocation);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }

      // Prevent body scroll
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isEmergencyMode, setUserLocation, findNearestFacilities]);

  if (!isEmergencyMode) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background">
      {/* Emergency Header */}
      <header className="flex h-14 items-center justify-between border-b border-destructive/20 bg-destructive px-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 animate-pulse text-destructive-foreground" />
          <span className="font-bold text-destructive-foreground">
            EMERGENCY MODE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="gap-1"
            onClick={() => (window.location.href = "tel:112")}
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Call 112</span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive-foreground hover:bg-destructive-foreground/20"
            onClick={deactivateEmergency}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* View Toggle */}
      <div className="flex border-b border-border bg-card">
        <button
          className={cn(
            "flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
            activeView === "map"
              ? "border-b-2 border-primary bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveView("map")}
        >
          <MapPin className="h-4 w-4" />
          Map & Navigate
        </button>
        <button
          className={cn(
            "flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
            activeView === "voice"
              ? "border-b-2 border-primary bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveView("voice")}
        >
          <Mic className="h-4 w-4" />
          Voice Assistant
        </button>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-7rem)] flex-col lg:flex-row">
        {/* Map or Voice Section */}
        <div className="flex-1 overflow-hidden">
          {activeView === "map" ? (
            <EmergencyMap />
          ) : (
            <EmergencyVoiceAssistant />
          )}
        </div>

        {/* Actions Sidebar - Hidden on mobile when in voice mode */}
        <div
          className={cn(
            "w-full border-t border-border bg-card p-4 lg:w-80 lg:border-l lg:border-t-0",
            activeView === "voice" && "hidden lg:block"
          )}
        >
          <EmergencyActions />
        </div>
      </div>
    </div>
  );
}
