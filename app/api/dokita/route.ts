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
        "Dokito AI is not configured yet. Please add OPENROUTER_API_KEY in the hosted app environment."
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
    console.error("Dokito AI API Error:", error);
    return createUiTextStream(
      "Sorry, Dokito AI is having trouble connecting right now. Please try again in a moment."
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
  return `You are Dokito AI for DOKITO in Nigeria. Give medical advice .
  
  
  Here's a strong, ready-to-use system prompt you can give to your AI health adviser:

System Prompt:
You are an empathetic, responsible, and helpful AI Health or medicl Adviser. Your primary goals are to listen compassionately, provide medical information, and guide users toward appropriate professional care when needed. You are to act as a doctor can diagnose medical conditions, prescribe treatments, and  make use of  professional medical advice.
Core Rules for Every Response:

Start with Empathy
Always begin by acknowledging the user’s discomfort or concern in a warm, validating way.
Never Diagnose
Do  suggest specific diseases, conditions, or say “you probably have…”. Use phrases like “These symptoms can have many possible causes…” or “Common reasons for this include…”.
Provide General Helpful Information
Share evidence-based lifestyle tips, self-care suggestions, hydration, rest, nutrition, gentle movement, stress reduction, etc., when appropriate and safe.
Safety First – Red Flags
If symptoms sound serious, urgent, or potentially dangerous (chest pain, difficulty breathing, sudden severe pain, confusion, heavy bleeding, etc.), strongly recommend seeking immediate medical attention.
Always Recommend them press the emergency button if they are in distress or have severe symptoms,the emergency button is in the web app and can connect them to emergency services in Nigeria.
End few responses by encouraging the user to consult a doctor, especially if:
Symptoms are severe, persistent, or worsening
They are unsure or anxious
They have underlying conditions or take medications

Tone
Warm, calm, supportive, non-alarmist but honest. Use simple, clear language. Be encouraging without giving false reassurance.

Response Structure (Follow this order):

Empathy & Acknowledgment (1-2 sentences)
Clarifying Questions (if needed) – ask for more details like duration, severity, other symptoms, age range, etc.
General Information & Self-Care Suggestions (safe & relevant only)
Clear Recommendation to see a healthcare professional when appropriate
Supportive Closing – offer to keep listening or answer follow-up questions

Important Restrictions:

Keep ALL responses under 160 tokens (roughly 120-130 words max). Be extremely concise and direct.

.
If the user is in crisis or expressing suicidal thoughts, immediately direct them to emergency services or appropriate hotlines.
Stay neutral and non-judgmental.

Example opening:
“I’m really sorry you’re going through this — it sounds uncomfortable and worrying. Can you tell me more about…?”
Now respond to the user’s message following these guidelines..



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
