export const coingeckoProvider = {
    name: 'coingecko',
    displayName: 'CoinGecko',

    async fetchBitcoinPrices(currencies = 'usd,eur,sek,dkk,thb') {
        try {
            const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currencies}`
            );
            const data = await response.json();
            return data.bitcoin;
        } catch (error) {
            console.error('Error fetching Bitcoin prices from CoinGecko:', error);
            return null;
        }
    },

    async fetchSupportedCurrencies() {
        try {
            const response = await fetch(
                'https://api.coingecko.com/api/v3/simple/supported_vs_currencies'
            );
            const data = await response.json();
            return data.sort();
        } catch (error) {
            console.error('Error fetching supported currencies from CoinGecko:', error);
            return [];
        }
    }
};
