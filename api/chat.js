// /api/chat.js
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { messages } = await req.json?.() || req.body; // Vercel suportă ambele
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",         // ieftin & rapid pentru chat
      messages: [
        { role: "system", content: "You are a helpful assistant for meal-planner.ro." },
        ...(messages || [])
      ],
      temperature: 0.3,
      // max_tokens: 500,            // opțional: limitează costul
    });

    res.status(200).json({ reply: completion.choices[0].message });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "AI error" });
  }
}
