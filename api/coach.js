// api/coach.js
import 'dotenv/config';

// ---- Config din ENV ----
const USE_AI_MOCK = process.env.USE_AI_MOCK === '1';
const USE_OPENAI  = process.env.USE_OPENAI  === '1' && !!process.env.OPENAI_API_KEY;
const OLLAMA_URL  = process.env.OLLAMA_URL  || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

// Din Node 18+, fetch e global. Importă OpenAI doar dacă îl folosim:
let OpenAI, openaiClient;
if (USE_OPENAI) {
  ({ default: OpenAI } = await import('openai'));
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const systemPrompts = (lang) => ({
  general: `You are a friendly assistant for meal-planner.ro. Reply in ${lang}. Be concise.`,
  recipes: `You are a cooking assistant. Reply in ${lang}. Listează INGREDIENTE (cantități) și PAȘI.`,
  fitness: `You are a certified fitness coach. Reply in ${lang}. Începe cu încălzire, 4-6 exerciții cu seturi/reps și cooldown.`
});

function buildPrompt(mode, lang, messages) {
  const sys = systemPrompts(lang)[mode] || systemPrompts(lang).general;
  const userLines = messages
    .filter(m => m.role === 'user')
    .map(m => m.content);
  return [sys, ...userLines].join('\n\n');
}

async function askOllama({ prompt }) {
  const r = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false })
  });
  if (!r.ok) throw new Error(`Ollama HTTP ${r.status}`);
  const data = await r.json();
  return data.response;
}

async function askOpenAI({ mode, lang, messages }) {
  const sys = systemPrompts(lang)[mode] || systemPrompts(lang).general;
  const completion = await openaiClient.chat.completions.create({
    model: 'gpt-4.1-mini',
    temperature: 0.5,
    messages: [{ role: 'system', content: sys }, ...messages],
  });
  return completion.choices[0].message.content;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { mode = 'general', lang = 'ro', messages = [] } = req.body || {};

  // --- MOCK pentru test UI fără costuri ---
  if (USE_AI_MOCK) {
    const demo = mode === 'recipes'
      ? "🍲 Rețetă demo: *Orez cu legume*\nINGREDIENTE: orez 150g, morcov 1, ardei 1, ulei 1 lingură, sare.\nPAȘI: spală orezul, călește legumele 3–4m, adaugă orezul și 300ml apă, fierbe 12–15m."
      : "🏃 Program demo: 3 runde – jumping jacks 30s, genuflexiuni 12, flotări la perete 10, plank 20s. Încălzire 3m, cooldown 3m.";
    return res.status(200).json({ reply: { role: 'assistant', content: demo } });
  }

  try {
    let content;

    if (USE_OPENAI) {
      try {
        content = await askOpenAI({ mode, lang, messages });
      } catch (err) {
        // dacă nu ai credit / 429 → treci automat pe Ollama
        if (err?.status === 429 || err?.code === 'insufficient_quota') {
          const prompt = buildPrompt(mode, lang, messages);
          content = await askOllama({ prompt });
        } else {
          throw err;
        }
      }
    } else {
      const prompt = buildPrompt(mode, lang, messages);
      content = await askOllama({ prompt });
    }

    return res.status(200).json({ reply: { role: 'assistant', content } });
  } catch (err) {
    console.error(err);
    return res.status(200).json({
      reply: { role: 'assistant', content: '⚠️ Server indisponibil. Verifică dacă rulează Vercel dev și Ollama.' }
    });
  }
}
