import { NextResponse } from "next/server";

// Mock drug database
const DRUGS_DATABASE = [
  {
    id: "1",
    name: "Paracetamol",
    genericName: "Acetaminophen",
    nafdacNumber: "A4-1234567",
    isVerified: true,
    manufacturer: "Emzor Pharmaceuticals",
    dosageForm: "Tablet",
    strength: "500mg",
    indications: ["Pain relief", "Fever reduction", "Headache", "Body aches"],
    sideEffects: ["Nausea", "Allergic reactions (rare)", "Liver damage (overdose)"],
    warnings: ["Do not exceed 4g daily", "Avoid alcohol", "Consult doctor if symptoms persist"],
    interactions: ["Warfarin", "Alcohol", "Carbamazepine"],
    contraindications: ["Severe liver disease", "Paracetamol allergy"],
    dosageGuidelines: {
      adult: "500mg-1g every 4-6 hours, max 4g/day",
      child: "10-15mg/kg every 4-6 hours",
      elderly: "Same as adult, use with caution",
    },
  },
  {
    id: "2",
    name: "Ibuprofen",
    genericName: "Ibuprofen",
    nafdacNumber: "A4-2345678",
    isVerified: true,
    manufacturer: "Swiss Pharma Nigeria",
    dosageForm: "Tablet",
    strength: "400mg",
    indications: ["Pain relief", "Inflammation", "Fever", "Arthritis", "Menstrual pain"],
    sideEffects: ["Stomach upset", "Nausea", "Dizziness", "Headache", "GI bleeding (prolonged use)"],
    warnings: ["Take with food", "Avoid if pregnant", "Not for asthma patients", "Not for children under 12"],
    interactions: ["Aspirin", "Warfarin", "Lithium", "Methotrexate", "ACE inhibitors"],
    contraindications: ["Active peptic ulcer", "Severe kidney disease", "Third trimester pregnancy"],
    dosageGuidelines: {
      adult: "200-400mg every 4-6 hours, max 1.2g/day",
      child: "5-10mg/kg every 6-8 hours (children over 3 months)",
      elderly: "Use lowest effective dose",
    },
  },
  {
    id: "3",
    name: "Amoxicillin",
    genericName: "Amoxicillin",
    nafdacNumber: "A4-3456789",
    isVerified: true,
    manufacturer: "Fidson Healthcare",
    dosageForm: "Capsule",
    strength: "500mg",
    indications: ["Bacterial infections", "Ear infections", "Throat infections", "UTIs", "Respiratory infections"],
    sideEffects: ["Diarrhea", "Rash", "Nausea", "Allergic reactions", "Candidiasis"],
    warnings: ["Complete full course", "Report allergies", "May reduce contraceptive effectiveness", "Requires prescription"],
    interactions: ["Probenecid", "Methotrexate", "Warfarin", "Oral contraceptives"],
    contraindications: ["Penicillin allergy", "Mononucleosis"],
    dosageGuidelines: {
      adult: "250-500mg every 8 hours",
      child: "25-50mg/kg/day in divided doses",
      elderly: "Same as adult, adjust for kidney function",
    },
  },
  {
    id: "4",
    name: "Artemether-Lumefantrine",
    genericName: "Artemether-Lumefantrine",
    nafdacNumber: "A4-4567890",
    isVerified: true,
    manufacturer: "Novartis (Coartem)",
    dosageForm: "Tablet",
    strength: "20mg/120mg",
    indications: ["Uncomplicated malaria", "P. falciparum infection"],
    sideEffects: ["Headache", "Dizziness", "Nausea", "Abdominal pain", "Joint pain"],
    warnings: ["Take with food", "Complete full course", "Avoid in first trimester pregnancy", "May cause QT prolongation"],
    interactions: ["QT-prolonging drugs", "CYP3A4 inhibitors", "Grapefruit juice"],
    contraindications: ["Severe malaria", "Known QT prolongation", "First trimester pregnancy"],
    dosageGuidelines: {
      adult: "4 tablets twice daily for 3 days",
      child: "Based on body weight, consult guidelines",
      elderly: "Same as adult",
    },
  },
  {
    id: "5",
    name: "Metformin",
    genericName: "Metformin Hydrochloride",
    nafdacNumber: "A4-5678901",
    isVerified: true,
    manufacturer: "May & Baker Nigeria",
    dosageForm: "Tablet",
    strength: "500mg",
    indications: ["Type 2 diabetes", "Prediabetes", "PCOS"],
    sideEffects: ["GI upset", "Diarrhea", "Nausea", "Metallic taste", "Vitamin B12 deficiency (long-term)"],
    warnings: ["Monitor kidney function", "Stop before surgery", "Avoid alcohol", "Check B12 levels annually"],
    interactions: ["Contrast dyes", "Alcohol", "Cimetidine", "Diuretics"],
    contraindications: ["Severe kidney disease", "Metabolic acidosis", "Dehydration"],
    dosageGuidelines: {
      adult: "Start 500mg once or twice daily, max 2g/day",
      child: "10-17 years: 500mg 1-3 times daily",
      elderly: "Start low, titrate slowly",
    },
  },
];

// Drug interactions matrix
const INTERACTIONS_MATRIX: Record<string, Record<string, { severity: string; description: string }>> = {
  paracetamol: {
    warfarin: {
      severity: "moderate",
      description: "Paracetamol may enhance the anticoagulant effect of Warfarin. Monitor INR closely.",
    },
    alcohol: {
      severity: "severe",
      description: "Combined use increases risk of liver damage. Avoid alcohol while taking paracetamol.",
    },
  },
  ibuprofen: {
    aspirin: {
      severity: "moderate",
      description: "Concurrent use may reduce the cardioprotective effects of aspirin and increase GI bleeding risk.",
    },
    warfarin: {
      severity: "severe",
      description: "Significantly increased risk of bleeding. Avoid combination or monitor closely.",
    },
    metformin: {
      severity: "moderate",
      description: "NSAIDs may reduce renal blood flow, potentially affecting metformin clearance.",
    },
  },
  metformin: {
    alcohol: {
      severity: "severe",
      description: "Increased risk of lactic acidosis. Limit alcohol consumption.",
    },
    ibuprofen: {
      severity: "moderate",
      description: "NSAIDs may affect kidney function and metformin clearance.",
    },
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const nafdacNumber = searchParams.get("nafdac");

  // Search by NAFDAC number
  if (nafdacNumber) {
    const drug = DRUGS_DATABASE.find(
      (d) => d.nafdacNumber.toLowerCase() === nafdacNumber.toLowerCase()
    );
    
    if (drug) {
      return NextResponse.json({ verified: true, drug });
    }
    return NextResponse.json({ verified: false, message: "NAFDAC number not found" });
  }

  // Search by name
  if (query) {
    const q = query.toLowerCase();
    const results = DRUGS_DATABASE.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.genericName.toLowerCase().includes(q)
    );
    
    return NextResponse.json({ drugs: results, total: results.length });
  }

  return NextResponse.json({ drugs: DRUGS_DATABASE, total: DRUGS_DATABASE.length });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action } = body;

  if (action === "check_interaction") {
    const { drug1, drug2 } = body;
    
    if (!drug1 || !drug2) {
      return NextResponse.json(
        { error: "Both drug names are required" },
        { status: 400 }
      );
    }

    const d1 = drug1.toLowerCase();
    const d2 = drug2.toLowerCase();

    // Check interaction in both directions
    const interaction = 
      INTERACTIONS_MATRIX[d1]?.[d2] || 
      INTERACTIONS_MATRIX[d2]?.[d1];

    if (interaction) {
      return NextResponse.json({
        hasInteraction: true,
        drug1,
        drug2,
        severity: interaction.severity,
        description: interaction.description,
      });
    }

    return NextResponse.json({
      hasInteraction: false,
      drug1,
      drug2,
      severity: "none",
      description: `No known interaction found between ${drug1} and ${drug2}. However, always consult your healthcare provider.`,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
