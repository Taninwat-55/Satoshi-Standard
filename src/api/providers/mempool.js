export const mempoolProvider = {
    name: 'mempool',
    displayName: 'Mempool.space',

    // Mempool.space supports a limited set of currencies
    // API returns: {"time":1767662705,"USD":93973,"EUR":80220,"GBP":69417,"CAD":129051,"CHF":74428,"AUD":140187,"JPY":14713812}
    supportedCurrencies: ['usd', 'eur', 'gbp', 'cad', 'chf', 'aud', 'jpy'],

    async fetchBitcoinPrices() {
        try {
            const response = await fetch('https://mempool.space/api/v1/prices');
            const data = await response.json();

            // Transform response to match CoinGecko format: { usd: 123, eur: 456 }
            const prices = {};
            this.supportedCurrencies.forEach(currency => {
                const key = currency.toUpperCase();
                if (data[key]) {
                    prices[currency] = data[key];
                }
            });

            return prices;
        } catch (error) {
            console.error('Error fetching Bitcoin prices from Mempool.space:', error);
            return null;
        }
    },

    async fetchSupportedCurrencies() {
        return this.supportedCurrencies;
    },

    async fetchBitcoinPriceHistoryRange(currency, days = 365) {
        try {
            // Mempool endpoint: /api/v1/historical-price?currency={code}
            // It returns full history. We will filter by 'days' on client side.
            // Format: Array of { time: 1234567890, USD: 12345.67 } (if currency is USD) / or "prices": [...]
            // Actually API returns array of objects directly: [{ time: 111, USD: 222 }, ...]

            const targetCurrency = currency.toUpperCase();

            // Note: Official mempool.space might not support this endpoint.
            // Using mempool.emzy.de which is a known reliable instance for historical data.
            const url = `https://mempool.emzy.de/api/v1/historical-price?currency=${targetCurrency}`;

            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 400 && targetCurrency === 'USD') {
                    // Sometimes USD assumes default? Retry without param?
                }
                throw new Error(`Mempool API error: ${response.status}`);
            }

            const data = await response.json();

            // Filter by days
            const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

            // Map to [timestamp, price]
            // Data item: { time: 1367193600, USD: 139.08 }
            // Note: time is in seconds.

            const prices = data
                .map(item => {
                    const price = item[targetCurrency] || item.price || item.USD; // Fallback
                    return [item.time * 1000, parseFloat(price)];
                })
                .filter(item => item[0] >= cutoff);

            return prices;

        } catch (error) {
            console.error('Error fetching Bitcoin history from Mempool.space:', error);
            // Return null so it can try fallback if we keep one.
            return null;
        }
    }
};
