// Stripe Webhook Edge Function
// Handles subscription lifecycle events from Stripe

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.9.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2023-10-16",
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
        return new Response("Missing stripe-signature header", { status: 400 });
    }

    try {
        const body = await req.text();
        const event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            webhookSecret
        );

        // Initialize Supabase admin client
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log(`Processing event: ${event.type}`);

        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;

                // Get user ID from metadata
                const userId = session.metadata?.user_id;
                if (!userId) {
                    console.error("No user_id in session metadata");
                    break;
                }

                // Get or create Stripe customer ID
                const customerId = session.customer as string;

                // Update user profile to Pro tier
                const { error } = await supabase
                    .from("profiles")
                    .update({
                        subscription_tier: "pro",
                        stripe_customer_id: customerId,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", userId);

                if (error) {
                    console.error("Error updating profile:", error);
                } else {
                    console.log(`User ${userId} upgraded to Pro`);
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Downgrade user to free tier
                const { error } = await supabase
                    .from("profiles")
                    .update({
                        subscription_tier: "free",
                        updated_at: new Date().toISOString(),
                    })
                    .eq("stripe_customer_id", customerId);

                if (error) {
                    console.error("Error downgrading profile:", error);
                } else {
                    console.log(`Customer ${customerId} downgraded to Free`);
                }
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Check if subscription is still active
                const isActive = ["active", "trialing"].includes(subscription.status);

                const { error } = await supabase
                    .from("profiles")
                    .update({
                        subscription_tier: isActive ? "pro" : "free",
                        updated_at: new Date().toISOString(),
                    })
                    .eq("stripe_customer_id", customerId);

                if (error) {
                    console.error("Error updating subscription status:", error);
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error("Webhook error:", err);
        return new Response(`Webhook Error: ${err.message}`, {
            status: 400,
            headers: corsHeaders,
        });
    }
});
