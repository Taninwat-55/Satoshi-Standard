import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PriceChangeBadge from './PriceChangeBadge';

describe('PriceChangeBadge Component', () => {
    const mockItem = {
        id: 1,
        name: 'Test Item',
        price: '50000', // $50,000 USD
        currency: 'usd',
        sats: 100000000, // Originally 1 BTC (when BTC was $50k)
    };

    it('renders nothing if currentBtcPrice is missing', () => {
        const { container } = render(<PriceChangeBadge item={mockItem} currentBtcPrice={null} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders "Stable" if price change is negligible', () => {
        // Current price same as original ($50k)
        render(<PriceChangeBadge item={mockItem} currentBtcPrice={50000} />);
        expect(screen.getByText(/stable/i)).toBeInTheDocument();
    });

    it('renders "Cheaper" (green) if BTC price goes UP (sats cost goes DOWN)', () => {
        // BTC doubles to $100k. Item (fixed $50k) should now cost 0.5 BTC (50m sats).
        // Original sats: 100m. New sats: 50m. Diff: -50%.
        render(<PriceChangeBadge item={mockItem} currentBtcPrice={100000} />);

        const badge = screen.getByText(/50.0% Cheaper/i);
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('text-green-400');
    });

    it('renders "More Exp." (red) if BTC price goes DOWN (sats cost goes UP)', () => {
        // BTC halves to $25k. Item (fixed $50k) should now cost 2 BTC (200m sats).
        // Original sats: 100m. New sats: 200m. Diff: +100%.
        render(<PriceChangeBadge item={mockItem} currentBtcPrice={25000} />);

        const badge = screen.getByText(/100.0% More Exp./i);
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('text-red-400');
    });
});
