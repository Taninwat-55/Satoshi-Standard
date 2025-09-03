import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SavedItemsList from './SavedItemsList';

const mockItems = [
  { id: 1, name: 'Coffee', sats: 10000, price: '4.00', currency: 'usd' },
  { id: 2, name: 'Pizza', sats: 50000, price: '20.00', currency: 'usd' },
  { id: 3, name: 'Book', sats: 25000, price: '150.00', currency: 'sek' },
];

describe('SavedItemsList Component', () => {
  it('calculates and displays the total sats and fiat amounts correctly', () => {
    render(<SavedItemsList items={mockItems} />);

    const totalSection = screen.getByRole('heading', {
      name: /total/i,
    }).parentElement;

    expect(within(totalSection).getByText(/85,000 sats/i)).toBeInTheDocument();
    expect(within(totalSection).getByText(/24.00 USD/i)).toBeInTheDocument();
    expect(within(totalSection).getByText(/150.00 SEK/i)).toBeInTheDocument();
  });
});
