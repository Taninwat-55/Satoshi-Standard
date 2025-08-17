import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

const TEST_KEY = 'test-key';

describe('useLocalStorage Hook', () => {
  // (SV) Rensa localStorage innan varje test för att säkerställa att testerna är isolerade
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return the initial value if localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));

    // (SV) Värdet ska vara det vi skickade in från början
    expect(result.current[0]).toBe('initial');
  });

  it('should set and get a value from localStorage', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, ''));

    // (SV) Använd 'act' för att uppdatera state i hooken
    act(() => {
      result.current[1]('new value'); // result.current[1] är setValue-funktionen
    });

    // (SV) Värdet ska nu vara det nya värdet
    expect(result.current[0]).toBe('new value');
  });

  it('should retrieve an existing value from localStorage on initial render', () => {
    // (SV) Sätt ett värde i localStorage *innan* hooken renderas
    localStorage.setItem(TEST_KEY, JSON.stringify('existing value'));

    const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));

    // (SV) Hooken ska hitta och returnera det existerande värdet, inte det initiala
    expect(result.current[0]).toBe('existing value');
  });
});
