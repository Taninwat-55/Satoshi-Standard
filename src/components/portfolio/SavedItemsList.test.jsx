import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SavedItemsList from './SavedItemsList';
import * as SavedItemsHooks from '../../hooks/useSavedItems';

vi.mock('../../hooks/useSavedItems', () => ({
  useSavedItems: vi.fn(),
}));

const mockItems = [
  { id: 1, name: 'Coffee', sats: 10000, price: '4.00', currency: 'usd' },
  { id: 2, name: 'Pizza', sats: 50000, price: '20.00', currency: 'usd' },
  { id: 3, name: 'Book', sats: 25000, price: '150.00', currency: 'sek' },
];

describe('SavedItemsList Component', () => {
  it('calculates and displays the total sats and fiat amounts correctly', () => {
    // Mock the hook return value
    vi.mocked(SavedItemsHooks.useSavedItems).mockReturnValue({
      items: mockItems,
      removeItemFromList: vi.fn(),
      clearList: vi.fn(),
      editingId: null,
      setEditingId: vi.fn(),
      onUpdateItem: vi.fn(),
      sortCriteria: 'dateAdded-desc',
      setSortCriteria: vi.fn(),
      satoshiGoal: 1000000,
      setSatoshiGoal: vi.fn(),
      supportedCurrencies: ['usd', 'eur'],
      fetchPriceForCurrency: vi.fn(),
    });

    render(<SavedItemsList onCompare={vi.fn()} />);

    const totalSection = screen.getByRole('heading', {
      name: /total/i,
    }).parentElement;

    expect(within(totalSection).getByText(/85,000 sats/i)).toBeInTheDocument();
    expect(within(totalSection).getByText(/24.00 USD/i)).toBeInTheDocument();
    expect(within(totalSection).getByText(/150.00 SEK/i)).toBeInTheDocument();
  });

  it('renders portfolio goal and progress correctly', () => {
    vi.mocked(SavedItemsHooks.useSavedItems).mockReturnValue({
      items: mockItems,
      removeItemFromList: vi.fn(),
      clearList: vi.fn(),
      editingId: null,
      setEditingId: vi.fn(),
      onUpdateItem: vi.fn(),
      sortCriteria: 'dateAdded-desc',
      setSortCriteria: vi.fn(),
      satoshiGoal: 100000,
      setSatoshiGoal: vi.fn(),
      supportedCurrencies: ['usd', 'eur'],
      fetchPriceForCurrency: vi.fn(),
    });

    render(<SavedItemsList onCompare={vi.fn()} />);

    // Mock items total 85,000 sats. Goal is 100,000.
    // Progress should be 85%
    expect(screen.getByText(/85.0% Achieved/i)).toBeInTheDocument();
    expect(screen.getByText(/15,000 sats to go/i)).toBeInTheDocument();
  });
});
