import { emergencyCheck } from "@/lib/safety-engine";

type ToolResult = Record<string, unknown>;

type Drug = {
  name: string;
  genericName: string;
  nafdacNumber: string;
  isVerified: boolean;
  manufacturer: string;
  dosageForm: string;
  strength: string;
  indications: string[];
  sideEffects: string[];
  warnings: string[];
  interactions: string[];
};

type Facility = {
  name: string;
  type: string;
  address: string;
  phone: string;
  location: { lat: number; lng: number };
  is24Hours: boolean;
  hasEmergency: boolean;
  services: string[];
  state: string;
  sampleData: true;
};

const DISCLAIMER =
  "This is health information only, not a diagnosis or medical advice. Consult a qualified healthcare provider.";

const DRUGS: Drug[] = [
  {
    name: "Paracetamol",
    genericName: "Acetaminophen",
    nafdacNumber: "SYN-A4-1234567",
    isVerified: true,
    manufacturer: "Synthetic Emzor Example",
    dosageForm: "Tablet",
    strength: "500mg",
    indications: ["Pain relief", "Fever reduction", "Headache"],
    sideEffects: ["Nausea", "Rare allergic reactions", "Liver injury in overdose"],
    warnings: ["Avoid duplicate paracetamol products", "Avoid alcohol", "Consult a clinician if symptoms persist"],
    interactions: ["Warfarin", "Alcohol", "Carbamazepine"],
  },
  {
    name: "Ibuprofen",
    genericName: "Ibuprofen",
    nafdacNumber: "SYN-A4-2345678",
    isVerified: true,
    manufacturer: "Synthetic Swiss Pharma Example",
    dosageForm: "Tablet",
    strength: "400mg",
    indications: ["Pain relief", "Inflammation", "Fever"],
    sideEffects: ["Stomach upset", "Nausea", "Dizziness", "GI bleeding risk"],
    warnings: ["Take with food", "Avoid in late pregnancy", "Use caution with kidney disease or ulcers"],
    interactions: ["Aspirin", "Warfarin", "Lithium", "Methotrexate", "ACE inhibitors"],
  },
  {
    name: "Metformin",
    genericName: "Metformin Hydrochloride",
    nafdacNumber: "SYN-A4-5678901",
    isVerified: true,
    manufacturer: "Synthetic May & Baker Example",
    dosageForm: "Tablet",
    strength: "500mg",
    indications: ["Type 2 diabetes", "Prediabetes", "PCOS"],
    sideEffects: ["GI upset", "Diarrhea", "Nausea", "Vitamin B12 deficiency with long-term use"],
    warnings: ["Monitor kidney function", "Avoid excess alcohol", "Discuss contrast studies with a clinician"],
    interactions: ["Alcohol", "Contrast dyes", "Cimetidine", "Diuretics"],
  },
];

const INTERACTIONS: Record<string, Record<string, { severity: string; description: string }>> = {
  paracetamol: {
    warfarin: {
      severity: "moderate",
      description: "Paracetamol may increase anticoagulant effect with repeated use. Clinician monitoring is advised.",
    },
    alcohol: {
      severity: "severe",
      description: "Combined use can increase liver injury risk. Avoid alcohol while using paracetamol.",
    },
  },
  ibuprofen: {
    warfarin: {
      severity: "severe",
      description: "This combination can increase bleeding risk. Professional review is strongly recommended.",
    },
    aspirin: {
      severity: "moderate",
      description: "Concurrent use can increase stomach bleeding risk and may affect aspirin's cardioprotective effect.",
    },
    metformin: {
      severity: "moderate",
      description: "NSAIDs may affect kidney function, which can matter for metformin safety.",
    },
  },
  metformin: {
    alcohol: {
      severity: "severe",
      description: "Excess alcohol can increase risk of lactic acidosis in people taking metformin.",
    },
  },
};

const FACILITIES: Facility[] = [
  {
    name: "Synthetic Lagos Teaching Hospital",
    type: "teaching_hospital",
    address: "Idi-Araba demo district, Lagos",
    phone: "+234 800 000 0001",
    location: { lat: 6.5166, lng: 3.3584 },
    is24Hours: true,
    hasEmergency: true,
    services: ["Emergency", "Surgery", "Maternity", "Pediatrics", "ICU"],
    state: "Lagos",
    sampleData: true,
  },
  {
    name: "Synthetic Akoka Medical Centre",
    type: "clinic",
    address: "Akoka demo district, Lagos",
    phone: "+234 800 000 0002",
    location: { lat: 6.5199, lng: 3.3974 },
    is24Hours: true,
    hasEmergency: true,
    services: ["Emergency", "General Practice", "First Aid"],
    state: "Lagos",
    sampleData: true,
  },
  {
    name: "Synthetic Victoria Island Pharmacy",
    type: "pharmacy",
    address: "Victoria Island demo district, Lagos",
    phone: "+234 800 000 0003",
    location: { lat: 6.4281, lng: 3.4219 },
    is24Hours: false,
    hasEmergency: false,
    services: ["Medication counselling", "OTC medicines", "BP check"],
    state: "Lagos",
    sampleData: true,
  },
];

export const healthcareMcpTools = [
  {
    name: "triage_symptoms",
    title: "Triage symptoms",
    description:
      "Checks synthetic or de-identified symptom text for emergency red flags and returns educational triage guidance for Nigerian care contexts.",
    inputSchema: {
      type: "object",
      properties: {
        symptomText: { type: "string", description: "Synthetic or de-identified symptom description." },
        state: { type: "string", description: "Optional Nigerian state for emergency number routing." },
        latitude: { type: "number", description: "Optional demo latitude." },
        longitude: { type: "number", description: "Optional demo longitude." },
        containsRealPhi: {
          type: "boolean",
          description: "Set true if the text includes real PHI. The tool rejects real PHI.",
        },
      },
      required: ["symptomText"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, idempotentHint: true, destructiveHint: false },
  },
  {
    name: "search_drug_info",
    title: "Search synthetic drug info",
    description:
      "Searches a synthetic Nigerian drug-reference dataset and returns verification-style metadata, warnings, and safety disclaimers.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Drug name, generic name, or synthetic NAFDAC-like identifier." },
      },
      required: ["query"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, idempotentHint: true, destructiveHint: false },
  },
  {
    name: "check_drug_interaction",
    title: "Check drug interaction",
    description: "Checks a synthetic interaction matrix for two medicine names and returns educational safety guidance.",
    inputSchema: {
      type: "object",
      properties: {
        drugA: { type: "string" },
        drugB: { type: "string" },
      },
      required: ["drugA", "drugB"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, idempotentHint: true, destructiveHint: false },
  },
  {
    name: "find_care_options",
    title: "Find synthetic care options",
    description:
      "Finds nearby synthetic/de-identified facilities suitable for demos, with optional emergency and 24-hour filtering.",
    inputSchema: {
      type: "object",
      properties: {
        careType: { type: "string", enum: ["all", "hospital", "clinic", "pharmacy"] },
        emergencyOnly: { type: "boolean" },
        openNowOnly: { type: "boolean" },
        latitude: { type: "number" },
        longitude: { type: "number" },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, idempotentHint: true, destructiveHint: false },
  },
  {
    name: "summarize_synthetic_care_gap",
    title: "Summarize synthetic care gap",
    description:
      "Reviews synthetic/de-identified vitals, medications, allergies, and follow-up notes for care-gap flags without storing data.",
    inputSchema: {
      type: "object",
      properties: {
        syntheticPatientId: { type: "string", description: "Demo-only identifier, not a real MRN or patient ID." },
        vitals: { type: "array", items: { type: "string" } },
        medications: { type: "array", items: { type: "string" } },
        allergies: { type: "array", items: { type: "string" } },
        notes: { type: "array", items: { type: "string" } },
        containsRealPhi: {
          type: "boolean",
          description: "Set true if any input includes real PHI. The tool rejects real PHI.",
        },
      },
      required: ["syntheticPatientId"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, idempotentHint: true, destructiveHint: false },
  },
] as const;

export function callHealthcareMcpTool(name: string, args: Record<string, unknown> = {}): ToolResult {
  switch (name) {
    case "triage_symptoms":
      return triageSymptoms(args);
    case "search_drug_info":
      return searchDrugInfo(args);
    case "check_drug_interaction":
      return checkDrugInteraction(args);
    case "find_care_options":
      return findCareOptions(args);
    case "summarize_synthetic_care_gap":
      return summarizeSyntheticCareGap(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function rejectRealPhi(args: Record<string, unknown>) {
  if (args.containsRealPhi === true) {
    throw new Error("Real PHI is not accepted. Use synthetic or de-identified data only.");
  }
}

function triageSymptoms(args: Record<string, unknown>) {
  rejectRealPhi(args);
  const symptomText = requireString(args.symptomText, "symptomText");
  const emergency = emergencyCheck(
    symptomText,
    typeof args.state === "string" ? args.state : undefined,
    typeof args.latitude === "number" ? args.latitude : undefined,
    typeof args.longitude === "number" ? args.longitude : undefined
  );

  if (emergency.isEmergency) {
    return {
      urgency: "emergency",
      emergency,
      nextSteps: ["Call the listed emergency number now.", "Go to the nearest emergency-capable facility."],
      dataIntegrity: "Processed as synthetic/de-identified input. No data was stored.",
      disclaimer: DISCLAIMER,
    };
  }

  return {
    urgency: "non_emergency_information",
    possibleNextSteps: [
      "Monitor symptoms and seek care if they worsen.",
      "Consult a qualified healthcare provider for diagnosis and treatment.",
      "Use emergency services immediately for chest pain, breathing trouble, stroke signs, severe bleeding, collapse, poisoning, seizure, or severe allergic reaction.",
    ],
    dataIntegrity: "Processed as synthetic/de-identified input. No data was stored.",
    disclaimer: DISCLAIMER,
  };
}

function searchDrugInfo(args: Record<string, unknown>) {
  const query = requireString(args.query, "query").toLowerCase();
  const results = DRUGS.filter(
    (drug) =>
      drug.name.toLowerCase().includes(query) ||
      drug.genericName.toLowerCase().includes(query) ||
      drug.nafdacNumber.toLowerCase() === query
  );

  return {
    total: results.length,
    results,
    dataIntegrity: "Synthetic drug-reference data for demo use.",
    disclaimer: DISCLAIMER,
  };
}

function checkDrugInteraction(args: Record<string, unknown>) {
  const drugA = requireString(args.drugA, "drugA");
  const drugB = requireString(args.drugB, "drugB");
  const a = drugA.toLowerCase();
  const b = drugB.toLowerCase();
  const interaction = INTERACTIONS[a]?.[b] || INTERACTIONS[b]?.[a];

  return {
    drugA,
    drugB,
    hasInteraction: Boolean(interaction),
    severity: interaction?.severity || "none_known_in_synthetic_dataset",
    description:
      interaction?.description ||
      "No known interaction was found in the synthetic demo matrix. A pharmacist or clinician should verify.",
    disclaimer: DISCLAIMER,
  };
}

function findCareOptions(args: Record<string, unknown>) {
  const careType = typeof args.careType === "string" ? args.careType : "all";
  const emergencyOnly = args.emergencyOnly === true;
  const openNowOnly = args.openNowOnly === true;
  const latitude = typeof args.latitude === "number" ? args.latitude : undefined;
  const longitude = typeof args.longitude === "number" ? args.longitude : undefined;

  let facilities = FACILITIES.filter((facility) => {
    const normalizedType = facility.type.includes("hospital") ? "hospital" : facility.type;
    return careType === "all" || normalizedType === careType;
  });

  if (emergencyOnly) facilities = facilities.filter((facility) => facility.hasEmergency);
  if (openNowOnly) facilities = facilities.filter((facility) => facility.is24Hours);

  const ranked = facilities
    .map((facility) => ({
      ...facility,
      distanceKm:
        latitude && longitude
          ? Number(distanceKm(latitude, longitude, facility.location.lat, facility.location.lng).toFixed(1))
          : undefined,
    }))
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

  return {
    facilities: ranked,
    dataIntegrity: "Synthetic/de-identified facility data for marketplace demonstration.",
    disclaimer: emergencyOnly ? "For active emergencies in Nigeria, call 112 immediately." : DISCLAIMER,
  };
}

function summarizeSyntheticCareGap(args: Record<string, unknown>) {
  rejectRealPhi(args);
  const syntheticPatientId = requireString(args.syntheticPatientId, "syntheticPatientId");
  const vitals = stringArray(args.vitals);
  const medications = stringArray(args.medications);
  const allergies = stringArray(args.allergies);
  const notes = stringArray(args.notes);
  const text = [...vitals, ...medications, ...allergies, ...notes].join(" ").toLowerCase();
  const flags: string[] = [];

  if (/bp|blood pressure|hypertension|160\/|170\/|180\//i.test(text)) {
    flags.push("Possible blood-pressure follow-up needed.");
  }
  if (/diabetes|metformin|glucose|blood sugar|hba1c/i.test(text)) {
    flags.push("Diabetes monitoring or medication follow-up may be relevant.");
  }
  if (/missed|stopped|not taking|nonadherent/i.test(text)) {
    flags.push("Medication adherence check may be needed.");
  }
  if (allergies.length === 0) {
    flags.push("Allergy status is not documented in this synthetic summary.");
  }

  return {
    syntheticPatientId,
    flags,
    priority: flags.length >= 2 ? "review_recommended" : "routine",
    dataIntegrity: "Synthetic/de-identified input only. Nothing was stored.",
    disclaimer: DISCLAIMER,
  };
}

function requireString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} is required.`);
  }
  return value.trim();
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const radius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(degrees: number) {
  return degrees * (Math.PI / 180);
}
