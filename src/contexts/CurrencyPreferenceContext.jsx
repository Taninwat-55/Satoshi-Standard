import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CurrencyPreferenceContext = createContext(null);

export function CurrencyPreferenceProvider({ children }) {
  const [preferredCurrency, setPreferredCurrency] = useLocalStorage('satoshi-currency-pref', 'usd');
  return (
    <CurrencyPreferenceContext.Provider value={{ preferredCurrency, setPreferredCurrency }}>
      {children}
    </CurrencyPreferenceContext.Provider>
  );
}

export function useCurrencyPreference() {
  const ctx = useContext(CurrencyPreferenceContext);
  if (!ctx) throw new Error('useCurrencyPreference must be used within CurrencyPreferenceProvider');
  return ctx;
}
