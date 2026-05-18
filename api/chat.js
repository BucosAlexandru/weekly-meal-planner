// /api/chat.js
// SECURITY: Premium endpoint — requires { email, messages } in POST body.
// Auth:         requirePremium validates active Supabase subscription before any OpenAI call.
// Rate limit:   20 requests / 60 min per email (soft, per-instance — see rateLimiter.js).
// Input guard:  messages validated for shape, length, and content size.
import OpenAI from "openai";
import { requirePremium } from "./_lib/requirePremium.js";
import { checkRateLimit } from "./_lib/rateLimiter.js";

// Limits (adjust here if needed — keep in sync with SAAS_PLAN.md)
const RATE_LIMIT_MAX    = 20;          // requests per window
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 60 minutes in ms
const MAX_MESSAGES      = 20;          // max conversation turns per request
const MAX_CONTENT_CHARS = 2000;        // max chars per individual message

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const body = req.body || {};

    // ── 1. Premium auth ───────────────────────────────────────────────────
    // Validates email against Supabase tokens table. Returns 401/403 on failure.
    const email = await requirePremium(req, res);
    if (!email) return;

    // ── 2. Rate limiting (soft, per-instance) ─────────────────────────────
    const { allowed, retryAfterSec } = checkRateLimit(email, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
    if (!allowed) {
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        error: `Rate limit exceeded. Max ${RATE_LIMIT_MAX} requests per hour. Try again in ${retryAfterSec}s.`
      });
    }

    // ── 3. Input validation ───────────────────────────────────────────────
    const { messages } = body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: '`messages` must be an array.' });
    }
    if (messages.length > MAX_MESSAGES) {
      return res.status(400).json({ error: `Too many messages. Max ${MAX_MESSAGES} per request.` });
    }
    for (const m of messages) {
      if (!m || typeof m.role !== 'string' || typeof m.content !== 'string') {
        return res.status(400).json({ error: 'Each message must have string `role` and `content` fields.' });
      }
      if (m.content.length > MAX_CONTENT_CHARS) {
        return res.status(400).json({ error: `Message content too long. Max ${MAX_CONTENT_CHARS} characters.` });
      }
    }

    // ── 4. OpenAI call ────────────────────────────────────────────────────
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant for meal-planner.ro." },
        ...messages
      ],
      temperature: 0.3,
      max_tokens: 500, // cost cap — do not remove
    });

    res.status(200).json({ reply: completion.choices[0].message });
  } catch (e) {
    console.error('[chat] Error:', e.message);
    res.status(500).json({ error: "AI error" });
  }
}
