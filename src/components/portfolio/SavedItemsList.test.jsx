import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SavedItemsList from './SavedItemsList';
import * as SavedItemsHooks from '../../hooks/useSavedItems';

vi.mock('../../hooks/useSavedItems', () => ({
  useSavedItems: vi.fn(),
}));

vi.mock('./CategoryBreakdown', () => ({
  default: () => <div data-testid="category-breakdown">Mock Chart</div>,
}));

vi.mock('./PriceChangeBadge', () => ({
  default: () => <div data-testid="price-change-badge">Mock Badge</div>,
}));

const mockItems = [
  { id: 1, name: 'Coffee', sats: 10000, price: '4.00', currency: 'usd', category: 'Food' },
  { id: 2, name: 'Pizza', sats: 50000, price: '20.00', currency: 'usd', category: 'Food' },
  { id: 3, name: 'Book', sats: 25000, price: '150.00', currency: 'sek', category: 'Education' },
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
      itemCategories: ['Food', 'Education'],
    });

    render(<SavedItemsList onCompare={vi.fn()} />);

    const totalSection = screen.getByText(/Total Portfolio Value/i).parentElement;

    expect(within(totalSection).getByText(/85,000/i)).toBeInTheDocument();
    // Use regex to be more flexible with formatting
    expect(within(totalSection).getByText(/24\.00 USD/i)).toBeInTheDocument();
    expect(within(totalSection).getByText(/150\.00 SEK/i)).toBeInTheDocument();
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
      itemCategories: ['Food', 'Education'],
    });

    render(<SavedItemsList onCompare={vi.fn()} />);

    // Check for the percentage text specifically
    expect(screen.getByText('85.0%')).toBeInTheDocument();
    expect(screen.getByText('Achieved')).toBeInTheDocument();
  });

  it('renders category tags for items', () => {
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
      itemCategories: ['Food', 'Education'],
    });

    render(<SavedItemsList onCompare={vi.fn()} />);

    expect(screen.getAllByText('Food')).toHaveLength(2);
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByTestId('category-breakdown')).toBeInTheDocument();
    expect(screen.getAllByTestId('price-change-badge')).toHaveLength(3);
  });

  it('filters items by name search query', async () => {
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
      itemCategories: ['Food', 'Education'],
    });

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
      itemCategories: ['Food', 'Education'],
    });

    render(<SavedItemsList onCompare={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Education' } });

    await waitFor(() => {
      expect(screen.getByText('Book')).toBeInTheDocument();
      expect(screen.queryByText('Coffee')).not.toBeInTheDocument();
    });
  });

  it('shows no results message when search matches nothing', async () => {
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
      itemCategories: ['Food', 'Education'],
    });

    render(<SavedItemsList onCompare={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'NonExistentItem' } });

    expect(screen.getByText(/No items found/i)).toBeInTheDocument();
  });
});
