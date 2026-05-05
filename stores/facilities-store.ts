import { create } from "zustand";
import type { Facility } from "@/lib/types";

type FacilityType = Facility['type'] | "all";

interface FacilityFilters {
  type: FacilityType;
  is24Hours: boolean | null;
  hasEmergency: boolean | null;
  maxDistance: number | null; // in km
  searchQuery: string;
}

interface FacilitiesStore {
  facilities: Facility[];
  selectedFacility: Facility | null;
  isLoading: boolean;
  error: string | null;
  filters: FacilityFilters;
  userLocation: { lat: number; lng: number } | null;

  // Actions
  setFacilities: (facilities: Facility[]) => void;
  setSelectedFacility: (facility: Facility | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<FacilityFilters>) => void;
  resetFilters: () => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  getFilteredFacilities: () => Facility[];
}

const defaultFilters: FacilityFilters = {
  type: "all",
  is24Hours: null,
  hasEmergency: null,
  maxDistance: null,
  searchQuery: "",
};

export const useFacilitiesStore = create<FacilitiesStore>((set, get) => ({
  facilities: [],
  selectedFacility: null,
  isLoading: false,
  error: null,
  filters: defaultFilters,
  userLocation: null,

  setFacilities: (facilities) => set({ facilities }),
  
  setSelectedFacility: (facility) => set({ selectedFacility: facility }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setUserLocation: (userLocation) => set({ userLocation }),

  getFilteredFacilities: () => {
    const { facilities, filters, userLocation } = get();

    return facilities.filter((facility) => {
      // Type filter
      if (filters.type !== "all" && facility.type !== filters.type) {
        return false;
      }

      // 24 hours filter
      if (filters.is24Hours !== null && facility.isOpen24Hours !== filters.is24Hours) {
        return false;
      }

      // Emergency filter
      if (filters.hasEmergency !== null && facility.hasEmergency !== filters.hasEmergency) {
        return false;
      }

      // Distance filter
      if (filters.maxDistance !== null && userLocation) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          facility.latitude,
          facility.longitude
        );
        if (distance > filters.maxDistance) {
          return false;
        }
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = facility.name.toLowerCase().includes(query);
        const matchesAddress = facility.address.toLowerCase().includes(query);
        const matchesServices = facility.services.some((s) =>
          s.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesAddress && !matchesServices) {
          return false;
        }
      }

      return true;
    });
  },
}));

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
