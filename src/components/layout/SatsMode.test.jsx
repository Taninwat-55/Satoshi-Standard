import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SatsToggle from './SatsToggle';
import { useSavedItems } from '../../hooks/useSavedItems';

// Mock the hook directly
vi.mock('../../hooks/useSavedItems', () => ({
    useSavedItems: vi.fn()
}));

describe('Sats-Only Mode', () => {
    let mockSetSatsMode;

    beforeEach(() => {
        mockSetSatsMode = vi.fn();
        useSavedItems.mockReturnValue({
            satsMode: false,
            setSatsMode: mockSetSatsMode
        });
    });

    it('renders toggle button with correct initial state (Fiat Visible)', () => {
        render(<SatsToggle />);

        expect(screen.getByText('Fiat Visible')).toBeInTheDocument();
        // Check for specific styling class or icon if possible, but text is good enough
    });

    it('renders toggle button with correct active state (Sats Only)', () => {
        useSavedItems.mockReturnValue({
            satsMode: true,
            setSatsMode: mockSetSatsMode
        });

        render(<SatsToggle />);

        expect(screen.getByText('Sats Only')).toBeInTheDocument();
    });

    it('toggles mode when clicked', () => {
        render(<SatsToggle />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockSetSatsMode).toHaveBeenCalledWith(true);
    });

    it('toggles mode off when clicked while active', () => {
        useSavedItems.mockReturnValue({
            satsMode: true,
            setSatsMode: mockSetSatsMode
        });

        render(<SatsToggle />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockSetSatsMode).toHaveBeenCalledWith(false);
    });
});
