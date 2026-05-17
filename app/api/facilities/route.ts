import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type FacilityRow = {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  rating: number | null;
  is_24_hours: boolean;
  has_emergency: boolean;
  services: string[] | null;
  state: string | null;
  lga: string | null;
  is_sample_data?: boolean;
};

type FacilityResult = {
  id: string;
  name: string;
  type: string;
  address: string;
  phone?: string;
  location: { lat: number; lng: number };
  rating?: number;
  is24Hours: boolean;
  hasEmergency: boolean;
  services: string[];
  state?: string;
  lga?: string;
  distance?: string;
  estimatedTime?: string;
  distanceValue?: number;
  isSampleData?: boolean;
};

/* SAMPLE_FACILITIES removed - prefer Supabase then Google Places Web API */

async function fetchPlacesFromGoogle(lat: number, lng: number, type: string, limit = 20) {
  try {
    const serverKey = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!serverKey) return [];

    const typeMap: Record<string,string> = {
      hospital: "hospital",
      pharmacy: "pharmacy",
      clinic: "health",
      all: "",
    };

    const placeType = typeMap[type] ?? "";
    const location = `${lat},${lng}`;
    const radius = 5000; // 5km

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${encodeURIComponent(location)}&radius=${radius}&key=${encodeURIComponent(serverKey)}${placeType ? `&type=${encodeURIComponent(placeType)}` : ""}`;

    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results || data.results.length === 0) return [];

    return (data.results || []).slice(0, limit).map((p: any) => ({
      id: p.place_id || String(Math.random()),
      name: p.name,
      type: (p.types && p.types[0]) || "clinic",
      address: p.vicinity || p.formatted_address || "",
      phone: undefined,
      location: { lat: p.geometry.location.lat, lng: p.geometry.location.lng },
      rating: p.rating,
      is24Hours: (p.opening_hours && p.opening_hours.open_now) || false,
      hasEmergency: false,
      services: [],
      state: undefined,
      lga: undefined,
      isSampleData: false,
    }));
  } catch (err) {
    console.error("Google Places fetch failed:", err);
    return [];
  }
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");
  const type = searchParams.get("type") || "all";
  const is24Hours = searchParams.get("is24Hours");
  const hasEmergency = searchParams.get("hasEmergency");
  const query = searchParams.get("query") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

  const serverKey = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Prefer Google Places when a location and server key are provided, so users
  // see nearby facilities for their scanned location. Fall back to Supabase
  // only when Google returns no results.
  let facilities: FacilityResult[] = [];
  let source: "google" | "supabase" | "none" = "none";

  if (lat && lng && serverKey) {
    const googleResults = await fetchPlacesFromGoogle(lat, lng, type, limit);
    if (googleResults.length > 0) {
      facilities = googleResults as FacilityResult[];
      source = "google";
    }
  }

  if (facilities.length === 0) {
    facilities = await loadFacilitiesFromSupabase();
    if (facilities.length > 0) source = "supabase";
  }

  facilities = applyFilters(facilities, { type, is24Hours, hasEmergency, query });

  if (lat && lng) {
    facilities = facilities
      .map((facility) => addDistance(facility, lat, lng))
      .sort((a, b) => (a.distanceValue || 0) - (b.distanceValue || 0));
  }

  return NextResponse.json({
    facilities: facilities.slice(0, limit),
    total: facilities.length,
    source,
    sampleData: source === "sample" || facilities.some((facility) => facility.isSampleData),
  });
}

async function loadFacilitiesFromSupabase() {
  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("facilities")
      .select("id, name, type, address, phone, latitude, longitude, rating, is_24_hours, has_emergency, services, state, lga, is_sample_data")
      .order("name", { ascending: true });

    if (error) {
      console.error("Could not load facilities from Supabase:", error.message);
      return [];
    }

    return (data || []).map(toFacilityResult);
  } catch (error) {
    console.error("Facilities API Supabase fetch failed:", error);
    return [];
  }
}

function toFacilityResult(row: FacilityRow): FacilityResult {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    address: row.address,
    phone: row.phone || undefined,
    location: { lat: Number(row.latitude), lng: Number(row.longitude) },
    rating: row.rating ? Number(row.rating) : undefined,
    is24Hours: row.is_24_hours,
    hasEmergency: row.has_emergency,
    services: row.services || [],
    state: row.state || undefined,
    lga: row.lga || undefined,
    isSampleData: Boolean(row.is_sample_data),
  };
}

function applyFilters(
  facilities: FacilityResult[],
  filters: { type: string; is24Hours: string | null; hasEmergency: string | null; query: string }
) {
  let result = [...facilities];

  if (filters.type !== "all") {
    result = result.filter((facility) => normalizeTypeForFilter(facility.type) === filters.type);
  }

  if (filters.is24Hours === "true") {
    result = result.filter((facility) => facility.is24Hours);
  }

  if (filters.hasEmergency === "true") {
    result = result.filter((facility) => facility.hasEmergency);
  }

  if (filters.query) {
    const query = filters.query.toLowerCase();
    result = result.filter(
      (facility) =>
        facility.name.toLowerCase().includes(query) ||
        facility.address.toLowerCase().includes(query) ||
        facility.services.some((service) => service.toLowerCase().includes(query))
    );
  }

  return result;
}

function normalizeTypeForFilter(type: string) {
  if (type === "teaching_hospital" || type === "private_hospital") return "hospital";
  return type;
}

function addDistance(facility: FacilityResult, lat: number, lng: number): FacilityResult {
  const distance = calculateDistance(lat, lng, facility.location.lat, facility.location.lng);
  const estimatedTime = Math.max(Math.ceil(distance * 3), 1);

  return {
    ...facility,
    distance: `${distance.toFixed(1)} km`,
    estimatedTime: `${estimatedTime} mins`,
    distanceValue: distance,
  };
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const radius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radius * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
