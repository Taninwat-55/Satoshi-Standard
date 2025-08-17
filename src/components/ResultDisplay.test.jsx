// src/components/ResultDisplay.test.jsx

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResultDisplay from './ResultDisplay';

describe('ResultDisplay Component', () => {
  it('renders loading message when isLoading is true', () => {
    render(<ResultDisplay isLoading={true} result={null} />);

    // Kollar om texten "Loading price data..." finns i dokumentet
    expect(screen.getByText(/loading price data/i)).toBeInTheDocument();
  });

  it('renders "no result" message when there is no result', () => {
    render(<ResultDisplay isLoading={false} result={null} />);

    // Kollar om en uppmaning att fylla i formuläret finns
    expect(screen.getByText(/enter an item and price/i)).toBeInTheDocument();
  });

  it('renders the correct sats amount when a result is provided', () => {
    const mockResult = {
      name: 'A Test Item',
      sats: 12345,
    };
    render(<ResultDisplay isLoading={false} result={mockResult} />);

    // Kollar om namnet och det formaterade satoshi-värdet renderas korrekt
    expect(screen.getByText(/"A Test Item" costs/i)).toBeInTheDocument();
    expect(screen.getByText(/12,345 sats/i)).toBeInTheDocument();
  });
});
