// Create Checkout Session Edge Function
// Creates a Stripe Checkout session for Pro subscription upgrades

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.9.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2023-10-16",
});

const PRO_PRICE_ID = Deno.env.get("STRIPE_PRO_PRICE_ID")!;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Verify JWT and get user
        const authHeader = req.headers.get("Authorization")!;
        const token = authHeader.replace("Bearer ", "");

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Get user's profile to check if they already have Pro
        const { data: profile } = await supabase
            .from("profiles")
            .select("stripe_customer_id, subscription_tier")
            .eq("id", user.id)
            .single();

        if (profile?.subscription_tier === "pro") {
            return new Response(JSON.stringify({ error: "Already subscribed to Pro" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Parse request body for success/cancel URLs
        const { successUrl, cancelUrl } = await req.json();

        // Create or retrieve Stripe customer
        let customerId = profile?.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { user_id: user.id },
            });
            customerId = customer.id;

            // Update profile with Stripe customer ID
            await supabase
                .from("profiles")
                .update({ stripe_customer_id: customerId })
                .eq("id", user.id);
        }

        // Create Checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: PRO_PRICE_ID,
                    quantity: 1,
                },
            ],
            success_url: successUrl || `${req.headers.get("origin")}/?upgrade=success`,
            cancel_url: cancelUrl || `${req.headers.get("origin")}/?upgrade=canceled`,
            metadata: {
                user_id: user.id,
            },
        });

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Checkout error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
