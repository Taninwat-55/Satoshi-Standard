const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;

const getHeaders = () => {
    if (!API_KEY) return {};
    return {
        headers: {
            // Support both header formats just in case, though usually one is enough
            'x-cg-demo-api-key': API_KEY,
        },
    };
};

export const coingeckoProvider = {
    name: 'coingecko',
    displayName: 'CoinGecko',

    async fetchBitcoinPrices(currencies = 'usd,eur,sek,dkk,thb') {
        try {
            const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currencies}`,
                getHeaders()
            );

            if (!response.ok) {
                throw new Error(`Status: ${response.status}`);
            }

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
                'https://api.coingecko.com/api/v3/simple/supported_vs_currencies',
                getHeaders()
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
            const response = await fetch(url, getHeaders());

            if (response.status === 401 || response.status === 429) {
                console.warn(`CoinGecko Access Restricted (Status: ${response.status}). Data unavailable.`);
                return null;
            }

            if (!response.ok) {
                throw new Error(`Status: ${response.status}`);
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
