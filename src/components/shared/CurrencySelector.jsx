import { CURRENCIES } from '../../lib/currencies';
import { useCurrencyPreference } from '../../contexts/CurrencyPreferenceContext';

function CurrencySelector() {
  const { preferredCurrency, setPreferredCurrency } = useCurrencyPreference();

  return (
    <select
      value={preferredCurrency}
      onChange={(e) => setPreferredCurrency(e.target.value)}
      className='glass-input px-3 py-2 text-sm cursor-pointer text-neutral-300 hover:text-white transition-colors'
      title='Display currency'
    >
      {Object.entries(CURRENCIES).map(([code, { flag, name }]) => (
        <option key={code} value={code} className='bg-neutral-900'>
          {flag} {code.toUpperCase()} — {name}
        </option>
      ))}
    </select>
  );
}

export default CurrencySelector;
