// Tiered SFP OCR — Gemini 2.5 Flash (primary) → 2.5 Pro (escalate) → GPT-4o (tiebreaker).
// One implementation for Adept + NS + future. Tune PROMPT/parse per label schema in ONE place.
//
// Usage:
//   import { ocrLabel } from "ns-shared/ocr";
//   const r = await ocrLabel(base64Jpeg);   // { text, confidence, model }

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const PROMPT =
  "Extract every field from this supplement-facts / product label as JSON. " +
  "Return ONLY JSON: {\"fields\":{...},\"confidence\":0-1}. " +
  "confidence = your certainty the extraction is complete and correct.";

async function gemini(imageBase64, mimeType, model, key) {
  const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: mimeType, data: imageBase64 } }] }],
    }),
  });
  if (!res.ok) throw new Error(`gemini ${model} ${res.status}`);
  const j = await res.json();
  const text = j?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return { ...parse(text), model };
}

async function gpt4o(imageBase64, mimeType, key) {
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: [
        { type: "text", text: PROMPT },
        { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
      ] }],
    }),
  });
  if (!res.ok) throw new Error(`gpt-4o ${res.status}`);
  const j = await res.json();
  return { ...parse(j?.choices?.[0]?.message?.content ?? ""), model: "gpt-4o" };
}

function parse(text) {
  try {
    const m = text.match(/\{[\s\S]*\}/);
    const o = m ? JSON.parse(m[0]) : {};
    return { text, fields: o.fields ?? o, confidence: Number(o.confidence ?? 0) };
  } catch {
    return { text, fields: {}, confidence: 0 };
  }
}

export async function ocrLabel(imageBase64, mimeType = "image/jpeg", opts = {}) {
  const gkey = opts.googleKey ?? process.env.GOOGLE_AI_API_KEY;
  const okey = opts.openaiKey ?? process.env.OPENAI_API_KEY;
  const min = opts.minConfidence ?? 0.85;

  let r = await gemini(imageBase64, mimeType, "gemini-2.5-flash", gkey);
  if (r.confidence < min) r = await gemini(imageBase64, mimeType, "gemini-2.5-pro", gkey);
  if (r.confidence < min && okey) r = await gpt4o(imageBase64, mimeType, okey);
  return r;
}
