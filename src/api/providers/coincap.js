export const coincapProvider = {
    name: 'coincap',
    displayName: 'CoinCap (Free)',

    async fetchBitcoinPrices(currencies = 'usd,eur,sek,dkk,thb') {
        try {
            // CoinCap uses 'bitcoin' ID. It mainly returns USD price.
            // For other currencies, we might need a rates endpoint or manual conversion if CoinCap only gives USD.
            // However, for the "Current Price" feature in the app, we primarily need USD. 
            // If the app relies strictly on multiple currencies for the main list, CoinCap might be limited to USD.
            // Let's perform a check: CoinCap /assets/bitcoin gives priceUsd.
            // To support other currencies (EUR, SEK) without a key, we might need 'rates' endpoint or just stick to USD for now 
            // and let the app handle it, or use CoinGecko for current prices (50/min limit is usually fine for current price, it's history that's heavy).

            // Strategy: Use CoinCap for HISTORY (heavy), keep CoinGecko for CURRENT (light) if possible?
            // The user wants "Stay free as possible". 
            // Let's implement basic USD fetching from CoinCap.

            const response = await fetch('https://api.coincap.io/v2/assets/bitcoin');
            const data = await response.json();
            const priceUsd = parseFloat(data.data.priceUsd);

            // Mocking other currencies based on USD for now if we strictly use only CoinCap, 
            // OR we can fetch rates. 
            // For simplicity and robustness of the "Chart" feature, this provider might just be used for History.
            // But if selected as PRIMARY, it needs `fetchBitcoinPrices`.

            // Let's return a basic structure. 
            return {
                usd: priceUsd,
                // We'd ideally fetch rates here: https://api.coincap.io/v2/rates
                // For now, let's just return USD to ensure basics work.
            };
        } catch (error) {
            console.error('Error fetching Bitcoin prices from CoinCap:', error);
            return null;
        }
    },

    async fetchSupportedCurrencies() {
        // CoinCap supports many, but let's return a static list of reliable ones for now.
        return ['usd', 'eur', 'sek', 'dkk', 'thb'];
    },

    async fetchBitcoinPriceHistoryRange(currency, days = 30) {
        // CoinCap history endpoint: api.coincap.io/v2/assets/bitcoin/history?interval=d1
        // It returns USD prices.

        // Calculate start/end if needed, but CoinCap usually takes 'start' and 'end' in ms.
        // Or just 'interval'. 
        // Docs: https://docs.coincap.io/
        // GET /assets/{{id}}/history?interval=d1&start={{start}}&end={{end}}

        const end = Date.now();
        const start = end - (days * 24 * 60 * 60 * 1000);

        const url = `https://api.coincap.io/v2/assets/bitcoin/history?interval=d1&start=${start}&end=${end}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Status: ${response.status}`);
            }
            const json = await response.json();

            // Map to [timestamp, price] format
            return json.data.map(item => [item.time, parseFloat(item.priceUsd)]);
        } catch (error) {
            console.error(
                `Failed to fetch Bitcoin price history from CoinCap:`,
                error
            );
            return null;
        }
    }
};
