import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});

serve(async (req) => {
  // Tratare pentru preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*", // sau site-ul tău
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const { amount, currency } = await req.json();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // sau domeniul tău exact
        },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
