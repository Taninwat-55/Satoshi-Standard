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

    async fetchBitcoinPriceHistoryRange() {
        console.warn('Historical price data is not supported by Mempool.space provider.');
        return null;
    }
};
