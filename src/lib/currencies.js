export const CURRENCIES = {
  usd: { symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  eur: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
  sek: { symbol: 'kr', name: 'Swedish Krona', flag: '🇸🇪' },
  dkk: { symbol: 'kr', name: 'Danish Krone', flag: '🇩🇰' },
  thb: { symbol: '฿', name: 'Thai Baht', flag: '🇹🇭' },
};

export const formatCurrency = (amount, currency) => {
  const meta = CURRENCIES[currency?.toLowerCase()];
  const symbol = meta?.symbol ?? currency?.toUpperCase() ?? '';
  return `${symbol}${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

export const convertCurrency = (price, fromCurrency, toCurrency, btcPrices) => {
  if (
    fromCurrency === toCurrency ||
    !btcPrices?.[fromCurrency] ||
    !btcPrices?.[toCurrency]
  ) {
    return price;
  }
  const priceInBtc = price / btcPrices[fromCurrency];
  return priceInBtc * btcPrices[toCurrency];
};
