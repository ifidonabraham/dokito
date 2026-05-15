import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  return NextResponse.json({
    schemaVersion: "1.0",
    name: "DOKITO Healthcare MCP",
    slug: "dokito-healthcare-mcp",
    version: "0.1.0",
    description:
      "A Prompt Opinion-ready healthcare MCP server for Nigerian triage education, drug safety checks, synthetic care options, and care-gap review.",
    category: "Healthcare",
    technicalPath: "Path A: MCP Server",
    transport: "streamable-http",
    endpoints: {
      mcp: `${origin}/api/mcp`,
      manifest: `${origin}/api/marketplace`,
    },
    capabilities: [
      "Emergency red-flag triage",
      "Synthetic drug information lookup",
      "Synthetic drug interaction checks",
      "Synthetic facility discovery",
      "Synthetic/de-identified care-gap summarization",
    ],
    compliance: {
      phiPolicy: "No real PHI. Tools are designed for synthetic or de-identified data only.",
      dataRetention: "No MCP tool data is stored by this endpoint.",
      medicalScope: "Health education and triage support only. No diagnosis, prescribing, or replacement for clinicians.",
    },
    demo: {
      samplePrompt:
        "Use triage_symptoms with symptomText='Synthetic patient has chest tightness and difficulty breathing in Lagos' and state='Lagos'.",
    },
  });
}
