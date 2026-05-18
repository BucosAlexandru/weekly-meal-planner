// /api/chat.js
// SECURITY: Premium endpoint — requires { email, messages } in POST body.
// Unauthenticated requests are rejected with 401 before touching OpenAI.
import OpenAI from "openai";
import { requirePremium } from "./_lib/requirePremium.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const body = req.body || {};

    // Validate premium subscription before any OpenAI call (prevents billing abuse)
    const email = await requirePremium(req, res);
    if (!email) return; // requirePremium already sent 401/403

    const { messages } = body;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant for meal-planner.ro." },
        ...(messages || [])
      ],
      temperature: 0.3,
      max_tokens: 500, // cost cap per request
    });

    res.status(200).json({ reply: completion.choices[0].message });
  } catch (e) {
    console.error('[chat] Error:', e.message);
    res.status(500).json({ error: "AI error" });
  }
}
