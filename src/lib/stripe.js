import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Creates a Stripe Checkout session for Pro subscription
 * @param {Object} options - URLs for redirect after checkout
 * @returns {Promise<string>} - Checkout URL to redirect to
 */
export async function createCheckoutSession({ successUrl, cancelUrl } = {}) {
    if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not configured');
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error('Not authenticated');
    }

    const response = await supabase.functions.invoke('create-checkout', {
        body: { successUrl, cancelUrl },
    });

    if (response.error) {
        throw new Error(response.error.message || 'Failed to create checkout session');
    }

    return response.data.url;
}

/**
 * Opens Stripe Checkout in a new window/tab
 */
export async function openCheckout() {
    try {
        const url = await createCheckoutSession({
            successUrl: `${window.location.origin}/?upgrade=success`,
            cancelUrl: `${window.location.origin}/?upgrade=canceled`,
        });

        if (url) {
            window.location.href = url;
        }
    } catch (error) {
        console.error('Checkout error:', error);
        throw error;
    }
}
