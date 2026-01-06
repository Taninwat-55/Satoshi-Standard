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
    },

    async fetchBitcoinPriceHistoryRange(currency, days = 30) {
        const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=${currency}&days=${days}&interval=daily`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(
                    `Network response was not ok, status: ${response.status}`
                );
            }
            const data = await response.json();
            if (days > 90) {
                const dailyPrices = data.prices.filter((_, index) => index % 24 === 0);
                return dailyPrices;
            }
            return data.prices;
        } catch (error) {
            console.error(
                `Failed to fetch Bitcoin price history for ${currency} from CoinGecko:`,
                error
            );
            return null;
        }
    }
};
