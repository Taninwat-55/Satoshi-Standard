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
        // defined cutoff once
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

        // Helper to filter and map data
        const processData = (data, mapFn) => {
            return data.map(mapFn).filter(item => item[0] >= cutoff);
        };

        // 1. Try Mempool Mirror (emzy.de)
        try {
            console.log('Fetching history from Mempool (emzy.de)...');
            const targetCurrency = currency.toUpperCase();
            const url = `https://mempool.emzy.de/api/v1/historical-price?currency=${targetCurrency}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Status ${response.status}`);

            const text = await response.text();
            if (!text || text.trim().length === 0) throw new Error('Empty response');

            const data = JSON.parse(text);

            return processData(data, item => {
                const price = item[targetCurrency] || item.price || item.USD;
                return [item.time * 1000, parseFloat(price)];
            });

        } catch (error) {
            console.warn('Mempool.space (emzy) failed, attempting fallback to Blockchain.info:', error);
        }

        // 2. Try Blockchain.info (free, CORS-enabled via param)
        try {
            console.log('Fetching history from Blockchain.info...');
            // Blockchain.info only gives USD prices easily for history
            if (currency.toLowerCase() !== 'usd') {
                console.warn('Blockchain.info fallback only supports USD. Converting display to USD.');
            }

            // timespan should be close to 'days'. closest options: 1year, 2years, all?
            // custom param? &start=<timestamp> ?
            // API: charts/market-price?timespan=5years&format=json&cors=true
            const url = `https://api.blockchain.info/charts/market-price?timespan=5years&rollingAverage=8hours&format=json&cors=true`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Status ${response.status}`);

            const data = await response.json();

            // Format: { values: [ { x: 123 (seconds), y: price }, ... ] }
            return processData(data.values, item => {
                return [item.x * 1000, parseFloat(item.y)];
            });

        } catch (error) {
            console.error('All history providers failed:', error);
            return null;
        }
    }
};
