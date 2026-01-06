// verifiera att gränssnittet renderas korrekt under olika förhållanden.
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResultDisplay from './ResultDisplay';

describe('ResultDisplay Component', () => {
  it('renders loading skeleton when isLoading is true', () => {
    const { container } = render(<ResultDisplay isLoading={true} result={null} />);

    // Check for skeleton elements by class name
    const skeletons = container.getElementsByClassName('react-loading-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders "no result" message when there is no result', () => {
    render(<ResultDisplay isLoading={false} result={null} />);

    // (SV) Kollar om en uppmaning att fylla i formuläret finns
    expect(screen.getByText(/enter an item and price/i)).toBeInTheDocument();
  });

  it('renders the correct sats amount when a result is provided', () => {
    const mockResult = {
      name: 'A Test Item',
      sats: 12345,
    };
    render(<ResultDisplay isLoading={false} result={mockResult} />);

    expect(screen.getByText(/"A Test Item" costs/i)).toBeInTheDocument();
    expect(screen.getByText(/12,345 sats/i)).toBeInTheDocument();
  });
});
