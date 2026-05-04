// /api/ai-recipe.js
import OpenAI from "openai";
import recipes from "@/data/recipes"; // fallback local

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { lang, ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "Missing ingredients list." });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a creative international cooking assistant.
Always reply in ${lang}.
Use traditional recipes from real cuisines (mention the country).
Avoid simple generic dishes (pasta, salad, omelette).
Return the result as compact JSON with the following fields:
{
  "name": "...",
  "country": "...",
  "ingredients": ["..."],
  "howIsMade": "..."
}
Keep it short (under 120 words).
          `,
        },
        {
          role: "user",
          content: `Generează o rețetă folosind aceste ingrediente: ${ingredients.join(", ")}.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 250,
    });

    let aiResponse = completion.choices[0]?.message?.content?.trim();

    // în unele cazuri AI trimite text simplu, nu JSON → încercăm să îl convertim
    let recipe;
    try {
      recipe = JSON.parse(aiResponse);
    } catch {
      // fallback: extragem un text scurt dacă nu e JSON valid
      recipe = { name: "Rețetă AI", country: "Necunoscut", ingredients, howIsMade: aiResponse };
    }

    res.status(200).json({ recipe });
  } catch (err) {
    console.error("AI error:", err.message);

    // fallback local random
    const fallback = recipes[Math.floor(Math.random() * recipes.length)];
    const fallbackRecipe = {
      name: fallback.name?.ro || "Rețetă locală",
      country: fallback.origin?.ro || "România",
      ingredients: fallback.ingredients?.ro || [],
      howIsMade: fallback.howIsMade?.ro || "Gătește ingredientele și servește.",
    };

    res.status(200).json({
      recipe: fallbackRecipe,
      source: "fallback",
    });
  }
}
