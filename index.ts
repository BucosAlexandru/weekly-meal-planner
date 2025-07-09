import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});

const YOUR_DOMAIN = "https://meal-planner.ro"; // ajustează după domeniul tău

serve(async (req) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // Poți primi date din body dacă vrei, de ex. amount dinamc
    // const { amount } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "ron",
          product_data: { name: "Meal Planner – PDF nelimitat" },
          unit_amount: 1000,  // 10,00 RON
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/?success=true`,
      cancel_url: `${YOUR_DOMAIN}/?canceled=true`,
    });

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
