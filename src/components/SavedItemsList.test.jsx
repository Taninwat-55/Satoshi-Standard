// src/components/SavedItemsList.test.jsx

import { render, screen, within } from '@testing-library/react'; // Lägg till 'within' här
import { describe, it, expect, vi } from 'vitest';
import SavedItemsList from './SavedItemsList';

// ... (din mockItems-array är ofändrad) ...
const mockItems = [
  { id: 1, name: 'Coffee', sats: 10000, price: '4.00', currency: 'usd' },
  { id: 2, name: 'Pizza', sats: 50000, price: '20.00', currency: 'usd' },
  { id: 3, name: 'Book', sats: 25000, price: '150.00', currency: 'sek' },
];

describe('SavedItemsList Component', () => {
  // ... (de andra testerna är oförändrade) ...

  // UPPDATERA DETTA TESTET
  it('calculates and displays the total sats and fiat amounts correctly', () => {
    render(<SavedItemsList items={mockItems} />);

    // Hitta "Total"-sektionen genom att först hitta rubriken "Total"
    const totalSection = screen.getByRole('heading', {
      name: /total/i,
    }).parentElement;

    // Använd "within" för att BARA söka inuti "Total"-sektionen
    // Detta gör testet specifikt och löser felet
    expect(within(totalSection).getByText(/85,000 sats/i)).toBeInTheDocument();
    expect(within(totalSection).getByText(/24.00 USD/i)).toBeInTheDocument();
    expect(within(totalSection).getByText(/150.00 SEK/i)).toBeInTheDocument();
  });

  // ... (de andra testerna är oförändrade) ...
});
