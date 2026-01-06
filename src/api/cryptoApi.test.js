import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    setProvider,
    getProvider,
    fetchBitcoinPrices,
    fetchSupportedCurrencies,
    availableProviders,
} from './cryptoApi';
import { coingeckoProvider } from './providers/coingecko';
import { mempoolProvider } from './providers/mempool';

describe('cryptoApi', () => {
    beforeEach(() => {
        // Reset to default provider
        setProvider('coingecko');
        vi.clearAllMocks();
    });

    it('should initialize with CoinGecko provider', () => {
        const provider = getProvider();
        expect(provider.name).toBe('coingecko');
    });

    it('should switch to Mempool provider', () => {
        setProvider('mempool');
        const provider = getProvider();
        expect(provider.name).toBe('mempool');
    });

    it('should list available providers', () => {
        expect(availableProviders).toHaveLength(2);
        expect(availableProviders[0].id).toBe('coingecko');
        expect(availableProviders[1].id).toBe('mempool');
    });

    it('should delegate fetchBitcoinPrices to current provider', async () => {
        const mockPrices = { usd: 50000 };
        vi.spyOn(coingeckoProvider, 'fetchBitcoinPrices').mockResolvedValue(mockPrices);

        const prices = await fetchBitcoinPrices();
        expect(prices).toEqual(mockPrices);
        expect(coingeckoProvider.fetchBitcoinPrices).toHaveBeenCalled();
    });

    it('should delegate fetchBitcoinPrices to Mempool provider when switched', async () => {
        const mockPrices = { usd: 60000 };
        vi.spyOn(mempoolProvider, 'fetchBitcoinPrices').mockResolvedValue(mockPrices);

        setProvider('mempool');
        const prices = await fetchBitcoinPrices();
        expect(prices).toEqual(mockPrices);
        expect(mempoolProvider.fetchBitcoinPrices).toHaveBeenCalled();
    });
});
