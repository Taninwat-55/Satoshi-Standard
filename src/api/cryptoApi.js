import { coingeckoProvider } from './providers/coingecko';
import { mempoolProvider } from './providers/mempool';

const providers = {
  coingecko: coingeckoProvider,
  mempool: mempoolProvider,
};

let currentProvider = coingeckoProvider;

export function setProvider(providerName) {
  if (providers[providerName]) {
    currentProvider = providers[providerName];
  }
}

export function getProvider() {
  return currentProvider;
}

export const availableProviders = Object.values(providers).map((p) => ({
  id: p.name,
  name: p.displayName,
}));

export async function fetchSupportedCurrencies() {
  return await currentProvider.fetchSupportedCurrencies();
}

export async function fetchBitcoinPrices(currencies) {
  return await currentProvider.fetchBitcoinPrices(currencies);
}

export async function fetchBitcoinHistoricalPrice(date) {
  const url = `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${date}&localization=false`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 429) {
        console.warn('Rate limited by CoinGecko API. Please wait a moment.');
      }
      throw new Error(
        `Network response was not ok, status: ${response.status}`
      );
    }
    const data = await response.json();
    return data.market_data.current_price;
  } catch (error) {
    console.error(
      `Failed to fetch historical Bitcoin price for date ${date}:`,
      error
    );
    return null;
  }
}

export async function fetchBitcoinPriceHistoryRange(currency, days = 30) {
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
      `Failed to fetch Bitcoin price history for ${currency}:`,
      error
    );
    return null;
  }
}
