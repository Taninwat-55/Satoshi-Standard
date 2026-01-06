import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FiatLeakChart from './FiatLeakChart';
import * as cryptoApi from '../../api/cryptoApi';

// Mock react-chartjs-2 to avoid canvas issues
vi.mock('react-chartjs-2', () => ({
    Line: () => <div data-testid="line-chart">Line Chart</div>,
}));

// Mock cryptoApi
vi.mock('../../api/cryptoApi', () => ({
    fetchBitcoinPriceHistoryRange: vi.fn(),
    getProvider: vi.fn(),
}));

describe('FiatLeakChart', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        cryptoApi.fetchBitcoinPriceHistoryRange.mockReturnValue(new Promise(() => { })); // Never resolves
        render(<FiatLeakChart currency="usd" />);
        // Look for the spinner or loading indicator structure
        // In my code: <div className="animate-spin ...">
        // Just checking container presence might be enough or specific class
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('renders chart when data is fetched successfully', async () => {
        const mockPrices = [
            [1609459200000, 29000], // Jan 1 2021
            [1609545600000, 30000], // Jan 2 2021
        ];
        cryptoApi.fetchBitcoinPriceHistoryRange.mockResolvedValue(mockPrices);
        cryptoApi.getProvider.mockReturnValue({ name: 'coingecko' });

        render(<FiatLeakChart currency="usd" />);

        await waitFor(() => {
            expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        });
        expect(screen.getByText('Fiat Purchasing Power')).toBeInTheDocument();
    });

    it('renders error message when mempool provider is active', async () => {
        cryptoApi.fetchBitcoinPriceHistoryRange.mockResolvedValue([]);
        cryptoApi.getProvider.mockReturnValue({ name: 'mempool' });

        render(<FiatLeakChart currency="usd" />);

        await waitFor(() => {
            expect(screen.getByText(/Historical data is not available/i)).toBeInTheDocument();
        });
    });

    it('updates time range when buttons are clicked', async () => {
        const mockPrices = [[1609459200000, 29000]];
        cryptoApi.fetchBitcoinPriceHistoryRange.mockResolvedValue(mockPrices);
        cryptoApi.getProvider.mockReturnValue({ name: 'coingecko' });

        render(<FiatLeakChart currency="usd" />);

        await waitFor(() => expect(screen.getByTestId('line-chart')).toBeInTheDocument());

        const button5Y = screen.getByText('5Y');
        fireEvent.click(button5Y);

        await waitFor(() => {
            // Check if fetch was called with correct days (365 * 5 = 1825)
            expect(cryptoApi.fetchBitcoinPriceHistoryRange).toHaveBeenCalledWith('usd', 1825);
        });
    });
});
