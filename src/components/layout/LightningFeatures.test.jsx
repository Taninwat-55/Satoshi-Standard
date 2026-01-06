import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FeeTicker from './FeeTicker';
import LightningTip from './LightningTip';
import { mempoolProvider } from '../../api/providers/mempool';

// Mock Mempool Provider
vi.mock('../../api/providers/mempool', () => ({
    mempoolProvider: {
        fetchRecommendedFees: vi.fn()
    }
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn()
    }
}));

describe('Lightning Network Features', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('FeeTicker', () => {
        it('renders fees when fetched successfully', async () => {
            const mockFees = {
                fastestFee: 20,
                halfHourFee: 15,
                hourFee: 10,
                economyFee: 5,
                minimumFee: 1
            };
            mempoolProvider.fetchRecommendedFees.mockResolvedValue(mockFees);

            render(<FeeTicker />);

            await waitFor(() => {
                expect(screen.getByText(/20 sat\/vB/i)).toBeInTheDocument();
            });

            // Check tooltip content (title attribute)
            const ticker = screen.getByTitle(/Low: 10 sat\/vB/i);
            expect(ticker).toBeInTheDocument();
        });

        it('renders nothing if fetch fails', async () => {
            mempoolProvider.fetchRecommendedFees.mockResolvedValue(null);
            const { container } = render(<FeeTicker />);

            await waitFor(() => {
                expect(container.firstChild).toBeNull();
            });
        });
    });

    describe('LightningTip', () => {
        it('renders the floating button', () => {
            render(<LightningTip />);
            const button = screen.getByTitle('Send a Tip (Lightning)');
            expect(button).toBeInTheDocument();
        });

        it('opens modal on click', () => {
            render(<LightningTip />);
            const button = screen.getByTitle('Send a Tip (Lightning)');

            fireEvent.click(button);

            expect(screen.getByText('Value for Value')).toBeInTheDocument();
            expect(screen.getByText('Support this project with satoshis!')).toBeInTheDocument();
        });

        it('displays correct lightning address', () => {
            render(<LightningTip />);
            const button = screen.getByTitle('Send a Tip (Lightning)');
            fireEvent.click(button);

            // Default mock env might be undefined, so it uses default in component
            // Or we could mock import.meta.env if needed, but default is fine to check
            expect(screen.getByText('unluckyfortune785@walletofsatoshi.com')).toBeInTheDocument();
        });
    });
});
