// Price Cache Edge Function
// Caches BTC prices for 60 seconds to reduce API calls and avoid rate limits

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CACHE_TTL_SECONDS = 60;
const COINGECKO_API_KEY = Deno.env.get("COINGECKO_API_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PriceCache {
    currency: string;
    btc_price: number;
    fetched_at: string;
}

async function fetchFromCoinGecko(currencies: string): Promise<Record<string, number> | null> {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currencies}`;

    const headers: Record<string, string> = {};
    if (COINGECKO_API_KEY) {
        headers["x-cg-demo-api-key"] = COINGECKO_API_KEY;
    }

    try {
        const response = await fetch(url, { headers });

        if (!response.ok) {
            console.error(`CoinGecko API error: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return data.bitcoin;
    } catch (error) {
        console.error("Error fetching from CoinGecko:", error);
        return null;
    }
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        const currencies = url.searchParams.get("currencies") || "usd,eur,sek,dkk,thb";
        const currencyList = currencies.toLowerCase().split(",").map(c => c.trim());

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Check cache for all requested currencies
        const now = new Date();
        const cacheThreshold = new Date(now.getTime() - CACHE_TTL_SECONDS * 1000);

        const { data: cachedPrices, error: cacheError } = await supabase
            .from("price_cache")
            .select("*")
            .in("currency", currencyList)
            .gte("fetched_at", cacheThreshold.toISOString());

        if (cacheError) {
            console.error("Cache read error:", cacheError);
        }

        // Build response from cache
        const result: Record<string, number> = {};
        const cachedCurrencies = new Set<string>();

        if (cachedPrices) {
            for (const item of cachedPrices as PriceCache[]) {
                result[item.currency] = item.btc_price;
                cachedCurrencies.add(item.currency);
            }
        }

        // Find currencies that need fresh data
        const stale = currencyList.filter(c => !cachedCurrencies.has(c));

        if (stale.length > 0) {
            // Fetch fresh prices from CoinGecko
            const freshPrices = await fetchFromCoinGecko(stale.join(","));

            if (freshPrices) {
                // Update cache and result
                for (const [currency, price] of Object.entries(freshPrices)) {
                    result[currency] = price;

                    // Upsert into cache
                    await supabase
                        .from("price_cache")
                        .upsert({
                            currency,
                            btc_price: price,
                            fetched_at: now.toISOString(),
                        }, {
                            onConflict: "currency",
                        });
                }
            }
        }

        return new Response(JSON.stringify(result), {
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
                "X-Cache-Status": stale.length === 0 ? "HIT" : stale.length === currencyList.length ? "MISS" : "PARTIAL",
            },
        });

    } catch (error) {
        console.error("Price cache error:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
            },
        });
    }
});
