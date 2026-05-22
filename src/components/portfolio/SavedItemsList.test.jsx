import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SavedItemsList from './SavedItemsList';
import * as SavedItemsHooks from '../../hooks/useSavedItems';

vi.mock('../../hooks/useSavedItems', () => ({
  useSavedItems: vi.fn(),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    isAuthenticated: false,
    isPro: false,
    isConfigured: false,
  }),
}));

vi.mock('../../contexts/CurrencyPreferenceContext', () => ({
  useCurrencyPreference: () => ({ preferredCurrency: 'usd', setPreferredCurrency: vi.fn() }),
}));

vi.mock('./CategoryBreakdown', () => ({
  default: () => <div data-testid="category-breakdown">Mock Chart</div>,
}));

vi.mock('./PriceChangeBadge', () => ({
  default: () => <div data-testid="price-change-badge">Mock Badge</div>,
}));

vi.mock('./FiatLeakChart', () => ({
  default: () => <div data-testid="fiat-leak-chart">Mock Fiat Leak Chart</div>,
}));

const mockItems = [
  { id: 1, name: 'Coffee', sats: 10000, price: '4.00', currency: 'usd', category: 'Food', currentSats: 5000 },
  { id: 2, name: 'Pizza', sats: 50000, price: '20.00', currency: 'usd', category: 'Food', currentSats: 0 },
  { id: 3, name: 'Book', sats: 25000, price: '150.00', currency: 'sek', category: 'Education', currentSats: 25000 },
];

const baseMock = {
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
  itemCategories: ['Food', 'Education'],
  btcPrices: { usd: 50000, sek: 14000 },
};

describe('SavedItemsList Component', () => {
  it('calculates and displays the total sats correctly', () => {
    vi.mocked(SavedItemsHooks.useSavedItems).mockReturnValue(baseMock);

    render(<SavedItemsList onCompare={vi.fn()} />);

    // Total sats: 10000 + 50000 + 25000 = 85000
    expect(screen.getAllByText(/85,000/i).length).toBeGreaterThan(0);
  });

  it('renders portfolio goal and progress correctly', () => {
    vi.mocked(SavedItemsHooks.useSavedItems).mockReturnValue({
      ...baseMock,
      satoshiGoal: 100000,
    });

    render(<SavedItemsList onCompare={vi.fn()} />);

    expect(screen.getByText('85.0%')).toBeInTheDocument();
    expect(screen.getByText('Achieved')).toBeInTheDocument();
  });

  it('renders category tags for items', () => {
    vi.mocked(SavedItemsHooks.useSavedItems).mockReturnValue(baseMock);

    render(<SavedItemsList onCompare={vi.fn()} />);

    expect(screen.getAllByText('Food')).toHaveLength(2);
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByTestId('category-breakdown')).toBeInTheDocument();
    expect(screen.getAllByTestId('price-change-badge')).toHaveLength(3);
  });

  it('filters items by name search query', async () => {
    vi.mocked(SavedItemsHooks.useSavedItems).mockReturnValue(baseMock);

    render(<SavedItemsList onCompare={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Coffee' } });

    await waitFor(() => {
      expect(screen.getByText('Coffee')).toBeInTheDocument();
      expect(screen.queryByText('Pizza')).not.toBeInTheDocument();
      expect(screen.queryByText('Book')).not.toBeInTheDocument();
    });
  });

  it('filters items by category search query', async () => {
    vi.mocked(SavedItemsHooks.useSavedItems).mockReturnValue(baseMock);

    render(<SavedItemsList onCompare={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Education' } });

    await waitFor(() => {
      expect(screen.getByText('Book')).toBeInTheDocument();
      expect(screen.queryByText('Coffee')).not.toBeInTheDocument();
    });
  });

  it('shows no results message when search matches nothing', async () => {
    vi.mocked(SavedItemsHooks.useSavedItems).mockReturnValue(baseMock);

    render(<SavedItemsList onCompare={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'NonExistentItem' } });

    expect(screen.getByText(/No items match/i)).toBeInTheDocument();
  });

  it('renders stacking progress correctly', () => {
    vi.mocked(SavedItemsHooks.useSavedItems).mockReturnValue({
      ...baseMock,
      satoshiGoal: 100000,
    });

    render(<SavedItemsList onCompare={vi.fn()} />);

    // Coffee: 5000 / 10000 = 50%
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getAllByText(/Stacked:/)).toHaveLength(3);

    // Book: 25000 / 25000 = 100%
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
