import { convertToModelMessages, generateText, type UIMessage } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { buildEmergencyInfo, emergencyCheck, getEmergencyResponse } from "@/lib/safety-engine";

export const maxDuration = 30;

const SUPPORTED_LANGUAGES = ["en", "pcm", "yo", "ig", "ha"] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export async function POST(request: Request) {
  try {
    const {
      messages,
      language = "en",
    }: { messages: UIMessage[]; language?: string } = await request.json();

    const lang = isSupportedLanguage(language) ? language : "en";
    const lastText = getLastUserText(messages);

    if (lastText) {
      const safetyResult = emergencyCheck(lastText);
      if (safetyResult.isEmergency && safetyResult.condition) {
        const emergencyInfo = buildEmergencyInfo(safetyResult.condition, lang);
        const stepsList = emergencyInfo.firstAidInstructions.length
          ? `\n\nImmediate steps:\n${emergencyInfo.firstAidInstructions
              .map((step, index) => `${index + 1}. ${step}`)
              .join("\n")}`
          : "";

        return createUiTextStream(
          `EMERGENCY DETECTED\n\n${getEmergencyResponse(
            safetyResult.condition,
            lang
          )}${stepsList}\n\nCall: ${emergencyInfo.callNumber}\n\nThis is health information only. Call emergency services immediately.`
        );
      }
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return createUiTextStream(
        "Dokita is not configured yet. Please add OPENROUTER_API_KEY in the hosted app environment."
      );
    }

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const result = await generateText({
      model: openrouter("openai/gpt-4o-mini"),
      system: buildDokitaSystemPrompt(lang),
      messages: await convertToModelMessages(messages),
      temperature: 0.5,
      maxOutputTokens: 160,
      abortSignal: request.signal,
    });

    return createUiTextStream(result.text);
  } catch (error) {
    console.error("Dokita API Error:", error);
    return createUiTextStream(
      "Sorry, Dokita is having trouble connecting right now. Please try again in a moment."
    );
  }
}

function getLastUserText(messages: UIMessage[]) {
  const lastUserMessage = messages.filter((message) => message.role === "user").pop();

  return (
    lastUserMessage?.parts
      ?.filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join(" ") ?? ""
  );
}

function buildDokitaSystemPrompt(language: SupportedLanguage) {
  return `You are Dokita AI for DOKITO in Nigeria. Give health education and triage guidance only.

Safety rules:
- Never diagnose with certainty.
- Never prescribe drugs, antibiotics, antimalarials, or dosages.
- If symptoms suggest danger, tell the user to seek urgent care and call 112 or 199.
- Red flags: chest pain, trouble breathing, severe bleeding, unconsciousness, stroke signs, severe allergic reaction, poisoning, overdose, severe burns, pregnancy bleeding/severe pain, seizures, self-harm.
- For non-emergency symptoms, ask one simple follow-up question and suggest a care level: emergency, doctor soon, clinic/PHC, pharmacist, or home monitoring.
- Consider Nigerian context: malaria, typhoid, cholera, hypertension, diabetes, asthma, sickle-cell complications.

Style:
- Be calm, brief, and low-literacy friendly.
- Use 2 short paragraphs maximum.
- End with a clear next step.
- Include: "This is health information, not medical advice. Please consult a qualified healthcare provider."

Language: ${getLanguageInstruction(language)}`;
}

function getLanguageInstruction(language: SupportedLanguage) {
  switch (language) {
    case "pcm":
      return "Reply in Nigerian Pidgin. Keep medical words simple.";
    case "yo":
      return "Reply in simple Yoruba where possible, with English for medical terms.";
    case "ig":
      return "Reply in simple Igbo where possible, with English for medical terms.";
    case "ha":
      return "Reply in simple Hausa where possible, with English for medical terms.";
    default:
      return "Reply in clear, simple English. Avoid jargon.";
  }
}

function isSupportedLanguage(language: string): language is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
}

function createUiTextStream(message: string) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`0:${JSON.stringify(message)}\n`));
      controller.enqueue(
        encoder.encode(`d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`)
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  });
}
