// Sabina (سبينة) — Mizher Medical Hub's AI doctor-assistant.
// Server-only: holds the prompt, the Lovable AI Gateway calls and LOVABLE_API_KEY.
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  getLovableAiGatewayResponseHeaders,
} from "./run-id.server";

const GATEWAY_URL = "https://ai.gateway.lovable.dev";
const CHAT_MODEL = "openai/gpt-6.1-sol";
const SPEECH_MODEL = "google/gemini-3.1-flash-tts-preview";
const SPEECH_VOICE = "Sulafat"; // warm female voice

const ChatBody = z.object({
  lang: z.enum(["ar", "en"]),
  page: z.string().max(200).optional(),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) }))
    .min(1)
    .max(16),
});

const SpeechBody = z.object({
  lang: z.enum(["ar", "en"]),
  text: z.string().min(1).max(1200),
});

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function statusOf(error: unknown): number {
  const e = error as {
    statusCode?: number;
    status?: number;
    cause?: { statusCode?: number };
  } | null;
  return e?.statusCode ?? e?.status ?? e?.cause?.statusCode ?? 500;
}

type Row = Record<string, unknown>;
const clip = (v: unknown, n = 80) => (v == null ? "" : String(v).replace(/\s+/g, " ").slice(0, n));

/** A short, live snapshot of the platform's catalogue so Sabina can name real doctors, hospitals and labs. */
async function catalogSnapshot(): Promise<string> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return "";
  try {
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const [doctors, hospitals, labs, packages] = await Promise.all([
      db
        .from("doctors")
        .select(
          "id,name_en,name_ar,specialty_en,specialty_ar,location_en,consultation_fee,rating,experience_years,available_today",
        )
        .order("rating", { ascending: false })
        .limit(40),
      db
        .from("hospitals")
        .select("id,name_en,name_ar,city,type,specialties,rating")
        .order("rating", { ascending: false })
        .limit(25),
      db
        .from("labs")
        .select("id,name_en,name_ar,city,home_visit,working_hours,rating")
        .order("rating", { ascending: false })
        .limit(20),
      db
        .from("treatment_packages")
        .select("id,title_en,title_ar,price,duration_days,hospital_name,category")
        .limit(20),
    ]);
    const lines: string[] = [];
    const d = (doctors.data ?? []) as Row[];
    if (d.length) {
      lines.push("DOCTORS (link: /doctors/<id>):");
      for (const r of d)
        lines.push(
          `- ${clip(r["name_en"])} / ${clip(r["name_ar"])} | ${clip(r["specialty_en"])} / ${clip(r["specialty_ar"])} | ${clip(r["location_en"], 40)} | fee ${clip(r["consultation_fee"], 8)} JOD | rating ${clip(r["rating"], 4)} | ${r["available_today"] ? "available today" : ""} | id ${clip(r["id"], 40)}`,
        );
    }
    const h = (hospitals.data ?? []) as Row[];
    if (h.length) {
      lines.push("HOSPITALS (link: /hospitals/<id>):");
      for (const r of h)
        lines.push(
          `- ${clip(r["name_en"])} / ${clip(r["name_ar"])} | ${clip(r["city"], 30)} | ${clip(r["type"], 20)} | ${clip(Array.isArray(r["specialties"]) ? (r["specialties"] as unknown[]).join(", ") : r["specialties"], 90)} | id ${clip(r["id"], 40)}`,
        );
    }
    const l = (labs.data ?? []) as Row[];
    if (l.length) {
      lines.push("LABS (link: /labs/<id>):");
      for (const r of l)
        lines.push(
          `- ${clip(r["name_en"])} / ${clip(r["name_ar"])} | ${clip(r["city"], 30)} | home visit: ${r["home_visit"] ? "yes" : "no"} | ${clip(r["working_hours"], 40)} | id ${clip(r["id"], 40)}`,
        );
    }
    const p = (packages.data ?? []) as Row[];
    if (p.length) {
      lines.push("MEDICAL TOURISM PACKAGES (link: /packages/<id>):");
      for (const r of p)
        lines.push(
          `- ${clip(r["title_en"])} / ${clip(r["title_ar"])} | ${clip(r["price"], 8)} JOD | ${clip(r["duration_days"], 4)} days | ${clip(r["hospital_name"], 40)} | id ${clip(r["id"], 40)}`,
        );
    }
    return lines.join("\n");
  } catch {
    return "";
  }
}

function instructions(lang: "ar" | "en", page: string | undefined, catalog: string) {
  return `You are Sabina (سبينة), the warm, elegant and highly knowledgeable AI doctor-assistant of "Mizher Medical Hub" (مزهر الطبي), Jordan's trusted healthcare platform. You appear on the site as a friendly young female doctor in a white coat with a stethoscope.

LANGUAGE: Reply in ${lang === "ar" ? "Arabic — a natural, kind Levantine/Jordanian tone that stays clear and respectful (e.g. «أهلاً فيك», «ولا يهمك»). Address the visitor in a gender-neutral way" : "English, warm and professional"}. If the visitor clearly writes in the other language, answer in theirs.

STYLE: Short and helpful — usually 2 to 5 sentences, or a few bullet points. Light markdown only (**bold**, bullets, links). One gentle emoji at most (🩺 💙 🌿). Never invent facts, names, prices or availability that are not in the platform data below.

WHAT THE PLATFORM OFFERS (use these internal links as markdown, e.g. [الأطباء](/doctors)):
- /doctors — find doctors by specialty, see fees, ratings and book an appointment (in clinic, voice, video or message consultation). Doctor profile: /doctors/<id>.
- /hospitals — hospitals in Jordan, profiles and hospital booking (/hospitals/<id>, /hospitals/<id>/book).
- /labs and /tests — medical laboratories and lab tests, some with home visits (/labs/<id>).
- /marketplace — pharmacy & health products store with cart and online payment (/products/<id>).
- /packages — medical tourism treatment packages for visitors coming to Jordan (/packages/<id>).
- /community — health community posts and questions.
- /booking — the visitor's bookings; /profile — account, notifications and settings.
- Providers can join: /doctor-console (doctors), /hospital-console, /lab-console, /retailer-console (pharmacies/stores).
- /contact — support@mizhermedicalhub.com, phone & WhatsApp +962 7 9990 2083 (https://wa.me/962799902083). /about — about Mizher.
- Prices are in Jordanian Dinar (JOD, د.أ). Online payments are processed securely with PayPal.
- Visitors need a free account to book: /register or /login.

MEDICAL SAFETY (very important):
- You give general health information and help people reach the right specialist on Mizher — you do NOT diagnose, prescribe medicines or doses, or replace a doctor.
- For symptoms, suggest the suitable specialty and invite them to book a doctor on Mizher.
- Emergencies (chest pain, difficulty breathing, stroke signs, severe bleeding, loss of consciousness, suicidal thoughts, poisoning): tell them immediately to call Jordan's emergency number 911 or go to the nearest emergency department.
- Respect privacy: never ask for passwords or payment details.
- Stay on health and Mizher topics; politely steer other topics back.

The visitor is currently on page: ${page || "/"}.

LIVE PLATFORM DATA (may be empty while the catalogue is being filled — then simply guide them to the right section):
${catalog || "(no listings available right now)"}`;
}

export async function handleSabinaChat(request: Request): Promise<Response> {
  let body: z.infer<typeof ChatBody>;
  try {
    body = ChatBody.parse(await request.json());
  } catch {
    return json(400, { error: "invalid_request" });
  }
  if (body.messages[body.messages.length - 1]?.role !== "user")
    return json(400, { error: "invalid_request" });
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return json(500, { error: "ai_not_configured" });

  const catalog = await catalogSnapshot();
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: `${GATEWAY_URL}/v1`,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const messages: ModelMessage[] = body.messages.map((m) => ({ role: m.role, content: m.content }));
  const result = streamText({
    model: provider.responses(CHAT_MODEL),
    instructions: instructions(body.lang, body.page, catalog),
    messages,
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  // Read until the first piece of text (or an error) so failures keep their real status code.
  const iterator = (
    result.fullStream as AsyncIterable<{
      type: string;
      text?: string;
      delta?: string;
      error?: unknown;
    }>
  )[Symbol.asyncIterator]();
  let firstText = "";
  try {
    while (true) {
      const next = await iterator.next();
      if (next.done) break;
      const part = next.value;
      if (part.type === "error") {
        const status = statusOf(part.error);
        return json(status >= 400 ? status : 500, { error: "ai_failed", status });
      }
      if (part.type === "text-delta") {
        firstText = part.text ?? part.delta ?? "";
        if (firstText) break;
      }
    }
  } catch (error) {
    const status = statusOf(error);
    return json(status >= 400 ? status : 500, { error: "ai_failed", status });
  }
  if (!firstText) return json(502, { error: "empty_reply" });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(firstText));
      try {
        while (true) {
          const next = await iterator.next();
          if (next.done) break;
          const part = next.value;
          if (part.type === "text-delta") {
            const t = part.text ?? part.delta ?? "";
            if (t) controller.enqueue(encoder.encode(t));
          }
          if (part.type === "error") break;
        }
      } catch {
        /* stream closed by the visitor */
      }
      controller.close();
    },
  });
  const headers = getLovableAiGatewayResponseHeaders(undefined, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  const runId = runIdFetch.getRunId();
  if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
  return new Response(stream, { status: 200, headers });
}

export async function handleSabinaSpeech(request: Request): Promise<Response> {
  let body: z.infer<typeof SpeechBody>;
  try {
    body = SpeechBody.parse(await request.json());
  } catch {
    return json(400, { error: "invalid_request" });
  }
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return json(500, { error: "ai_not_configured" });

  const steer =
    body.lang === "ar"
      ? "Read the following Arabic text aloud as a young, warm, caring female doctor with a gentle Levantine Jordanian accent, calm and reassuring, natural pace: "
      : "Read the following aloud as a young, warm, caring female doctor, calm and reassuring, natural pace: ";
  let upstream: Response;
  try {
    upstream = await fetch(`${GATEWAY_URL}/v1/audio/speech`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: SPEECH_MODEL,
        contents: [{ role: "user", parts: [{ text: steer + body.text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: SPEECH_VOICE } } },
        },
        stream_format: "sse",
      }),
      signal: request.signal,
    });
  } catch {
    return json(502, { error: "speech_failed" });
  }
  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return json(upstream.status || 502, { error: "speech_failed", detail: text.slice(0, 300) });
  }
  return new Response(upstream.body, {
    status: 200,
    headers: getLovableAiGatewayResponseHeaders(upstream.headers, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
    }),
  });
}
