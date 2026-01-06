import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Converter from './Converter';
import * as SavedItemsHooks from '../../hooks/useSavedItems';

// Mock useSavedItems
vi.mock('../../hooks/useSavedItems', () => ({
    useSavedItems: vi.fn(),
}));

describe('Converter Component', () => {
    const mockBtcPrices = { usd: 50000, eur: 45000 };
    const mockSupportedCurrencies = ['usd', 'eur', 'jpy'];

    beforeEach(() => {
        vi.mocked(SavedItemsHooks.useSavedItems).mockReturnValue({
            addItemToList: vi.fn(),
        });
    });

    it('renders in default Fiat to Sats mode', () => {
        render(
            <Converter
                btcPrices={mockBtcPrices}
                isLoading={false}
                supportedCurrencies={mockSupportedCurrencies}
                fetchPriceForCurrency={vi.fn()}
            />
        );

        expect(screen.getByText(/Price an Item/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Price$/i)).toBeInTheDocument();
    });

    it('toggles to Sats to Fiat mode', () => {
        render(
            <Converter
                btcPrices={mockBtcPrices}
                isLoading={false}
                supportedCurrencies={mockSupportedCurrencies}
                fetchPriceForCurrency={vi.fn()}
            />
        );

        const toggleButton = screen.getByRole('button', { name: /Sats → Fiat/i });
        fireEvent.click(toggleButton);

        expect(screen.getByText(/Convert Sats to Fiat/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Amount \(Sats\)/i)).toBeInTheDocument();
    });

    it('calculates fiat value from sats correctly', () => {
        render(
            <Converter
                btcPrices={mockBtcPrices}
                isLoading={false}
                supportedCurrencies={mockSupportedCurrencies}
                fetchPriceForCurrency={vi.fn()}
            />
        );

        // Switch to Sats to Fiat
        const toggleButton = screen.getByRole('button', { name: /Sats → Fiat/i });
        fireEvent.click(toggleButton);

        // Enter 100,000,000 sats (1 BTC)
        const amountInput = screen.getByLabelText(/Amount \(Sats\)/i);
        fireEvent.change(amountInput, { target: { value: '100000000' } });

        // Result should be approx $50,000 (since 1 BTC = $50,000 in mock)
        expect(screen.getByText(/100,000,000 sats is equal to/i)).toBeInTheDocument();
        expect(screen.getByText(/\$50,000\.00/i)).toBeInTheDocument();
    });

    it('calculates sats from fiat correctly (default mode)', () => {
        render(
            <Converter
                btcPrices={mockBtcPrices}
                isLoading={false}
                supportedCurrencies={mockSupportedCurrencies}
                fetchPriceForCurrency={vi.fn()}
            />
        );

        // Default price is 4, USD is 50000.
        // 4 / 50000 = 0.00008 BTC = 8000 sats.

        expect(screen.getByText(/8,000 sats/i)).toBeInTheDocument();
    });
});
