import { NextResponse } from "next/server";

// Mock database of Nigerian healthcare facilities
const FACILITIES = [
  {
    id: "unilag-medical-centre",
    name: "University of Lagos Medical Centre",
    type: "clinic",
    address: "University of Lagos, Akoka, Lagos",
    phone: "+234 1 293 0330",
    location: { lat: 6.5199, lng: 3.3974 },
    rating: 4.1,
    is24Hours: true,
    hasEmergency: true,
    services: ["Emergency", "General Practice", "Student Health", "First Aid"],
    state: "Lagos",
    lga: "Lagos Mainland",
  },
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
    services: ["Emergency", "Surgery", "Pediatrics", "Maternity", "ICU", "Cardiology"],
    state: "Lagos",
    lga: "Lagos Mainland",
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
    services: ["Emergency", "Diagnostics", "Surgery", "ICU", "Oncology"],
    state: "Lagos",
    lga: "Eti-Osa",
  },
  {
    id: "3",
    name: "HealthPlus Pharmacy",
    type: "pharmacy",
    address: "Lekki Phase 1, Lagos",
    phone: "+234 812 345 6789",
    location: { lat: 6.441, lng: 3.4765 },
    rating: 4.0,
    is24Hours: false,
    hasEmergency: false,
    services: ["Prescriptions", "OTC Drugs", "Health Products", "Consultations"],
    state: "Lagos",
    lga: "Eti-Osa",
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
    services: ["Prescriptions", "24hr Service", "Delivery", "Vaccinations"],
    state: "Lagos",
    lga: "Ikeja",
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
    services: ["Emergency", "Cardiology", "Orthopedics", "Dialysis", "Maternity"],
    state: "Lagos",
    lga: "Lagos Island",
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
    services: ["General Practice", "Lab Tests", "Vaccinations", "Consultations"],
    state: "Lagos",
    lga: "Ikeja",
  },
  {
    id: "7",
    name: "National Hospital Abuja",
    type: "hospital",
    address: "Plot 132 Central District, Abuja",
    phone: "+234 9 234 5678",
    location: { lat: 9.0579, lng: 7.4951 },
    rating: 4.3,
    is24Hours: true,
    hasEmergency: true,
    services: ["Emergency", "Surgery", "Pediatrics", "Oncology", "Neurology"],
    state: "FCT",
    lga: "Municipal Area Council",
  },
  {
    id: "8",
    name: "University of Nigeria Teaching Hospital",
    type: "hospital",
    address: "Ituku-Ozalla, Enugu",
    phone: "+234 42 456 789",
    location: { lat: 6.4314, lng: 7.4989 },
    rating: 4.0,
    is24Hours: true,
    hasEmergency: true,
    services: ["Emergency", "Surgery", "Maternity", "Pediatrics", "Psychiatry"],
    state: "Enugu",
    lga: "Enugu South",
  },
];

type FacilityResult = (typeof FACILITIES)[number] & {
  distance?: string;
  estimatedTime?: string;
  distanceValue?: number;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");
  const type = searchParams.get("type") || "all";
  const is24Hours = searchParams.get("is24Hours");
  const hasEmergency = searchParams.get("hasEmergency");
  const query = searchParams.get("query") || "";
  const limit = parseInt(searchParams.get("limit") || "20");

  let facilities: FacilityResult[] = [...FACILITIES];

  // Filter by type
  if (type !== "all") {
    facilities = facilities.filter((f) => f.type === type);
  }

  // Filter by 24 hours
  if (is24Hours === "true") {
    facilities = facilities.filter((f) => f.is24Hours);
  }

  // Filter by emergency
  if (hasEmergency === "true") {
    facilities = facilities.filter((f) => f.hasEmergency);
  }

  // Search filter
  if (query) {
    const q = query.toLowerCase();
    facilities = facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        f.services.some((s) => s.toLowerCase().includes(q))
    );
  }

  // Calculate distance if coordinates provided
  if (lat && lng) {
    facilities = facilities.map((f) => {
      const distance = calculateDistance(lat, lng, f.location.lat, f.location.lng);
      const estimatedTime = Math.ceil(distance * 3); // Rough estimate: 3 min per km
      return {
        ...f,
        distance: `${distance.toFixed(1)} km`,
        estimatedTime: `${estimatedTime} mins`,
        distanceValue: distance,
      };
    });

    // Sort by distance
    facilities.sort((a, b) => (a.distanceValue || 0) - (b.distanceValue || 0));
  }

  return NextResponse.json({
    facilities: facilities.slice(0, limit),
    total: facilities.length,
  });
}

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
