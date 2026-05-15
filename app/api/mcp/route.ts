import { NextResponse } from "next/server";
import { callHealthcareMcpTool, healthcareMcpTools } from "@/lib/mcp-healthcare-tools";

const PROTOCOL_VERSION = "2025-06-18";
const SERVER_INFO = {
  name: "dokito-healthcare-mcp",
  title: "DOKITO Healthcare MCP",
  version: "0.1.0",
};

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

export async function GET() {
  return NextResponse.json({
    name: SERVER_INFO.name,
    title: SERVER_INFO.title,
    transport: "streamable-http",
    protocolVersion: PROTOCOL_VERSION,
    endpoint: "/api/mcp",
    tools: healthcareMcpTools.map(({ name, title, description }) => ({ name, title, description })),
    dataIntegrity: "This MCP server rejects declared real PHI and is intended for synthetic/de-identified data only.",
  });
}

export async function POST(request: Request) {
  let payload: JsonRpcRequest | JsonRpcRequest[];

  try {
    payload = await request.json();
  } catch {
    return jsonRpcError(null, -32700, "Parse error");
  }

  if (Array.isArray(payload)) {
    const responses = payload.map(handleMessage).filter(Boolean);
    return responses.length > 0 ? NextResponse.json(responses) : new NextResponse(null, { status: 204 });
  }

  const response = handleMessage(payload);
  return response ? NextResponse.json(response) : new NextResponse(null, { status: 204 });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, OPTIONS",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id",
    },
  });
}

function handleMessage(message: JsonRpcRequest) {
  const id = message.id ?? null;

  if (message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return makeError(id, -32600, "Invalid Request");
  }

  if (id === null && message.method !== "notifications/initialized") {
    return null;
  }

  try {
    switch (message.method) {
      case "initialize":
        return makeResult(id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {
            tools: { listChanged: false },
          },
          serverInfo: SERVER_INFO,
          instructions:
            "Use only synthetic or de-identified healthcare data. This server provides education, triage, drug, care-option, and care-gap support. It does not diagnose, prescribe, or store PHI.",
        });
      case "notifications/initialized":
        return null;
      case "ping":
        return makeResult(id, {});
      case "tools/list":
        return makeResult(id, { tools: healthcareMcpTools });
      case "tools/call":
        return handleToolCall(id, message.params);
      default:
        return makeError(id, -32601, `Method not found: ${message.method}`);
    }
  } catch (error) {
    return makeError(id, -32603, error instanceof Error ? error.message : "Internal error");
  }
}

function handleToolCall(id: string | number | null, params: Record<string, unknown> | undefined) {
  const name = typeof params?.name === "string" ? params.name : "";
  const args = isRecord(params?.arguments) ? params.arguments : {};
  const result = callHealthcareMcpTool(name, args);

  return makeResult(id, {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
    isError: false,
  });
}

function makeResult(id: string | number | null, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function makeError(id: string | number | null, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function jsonRpcError(id: string | number | null, code: number, message: string) {
  return NextResponse.json(makeError(id, code, message), { status: 400 });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
