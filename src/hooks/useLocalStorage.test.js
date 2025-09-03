import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

const TEST_KEY = 'test-key';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return the initial value if localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));

    expect(result.current[0]).toBe('initial');
  });

  it('should set and get a value from localStorage', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, ''));

    act(() => {
      result.current[1]('new value'); // result.current[1] är setValue-funktionen
    });

    expect(result.current[0]).toBe('new value');
  });

  it('should retrieve an existing value from localStorage on initial render', () => {
    localStorage.setItem(TEST_KEY, JSON.stringify('existing value'));

    const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));

    expect(result.current[0]).toBe('existing value');
  });
});
