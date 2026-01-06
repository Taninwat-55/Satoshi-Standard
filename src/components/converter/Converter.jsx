import React, { useState, useEffect, useCallback } from 'react';
import InputForm from './InputForm';
import ResultDisplay from './ResultDisplay';
import { useSavedItems } from '../../hooks/useSavedItems';

function Converter({
  btcPrices,
  isLoading,
  supportedCurrencies,
  fetchPriceForCurrency,
}) {
  const { addItemToList, itemCategories } = useSavedItems();
  const [itemName, setItemName] = useState('A cup of coffee');
  const [price, setPrice] = useState('4');
  const [currency, setCurrency] = useState('usd');
  const [category, setCategory] = useState(''); // NEW state
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState('fiatToSats'); // 'fiatToSats' or 'satsToFiat'

  const calculateSats = useCallback(() => {
    if (
      !btcPrices ||
      !price ||
      isNaN(price) ||
      price <= 0 ||
      !btcPrices[currency]
    ) {
      setResult(null);
      return;
    }

    const btcPriceInSelectedCurrency = btcPrices[currency];

    if (mode === 'fiatToSats') {
      const priceInBtc = parseFloat(price) / btcPriceInSelectedCurrency;
      const priceInSats = priceInBtc * 100_000_000;

      setResult({
        sats: Math.round(priceInSats),
        name: itemName || 'Something',
        price: price, // Original Fiat Price
        currency: currency,
        category: category, // Pass category
        mode: mode,
      });
    } else {
      // Sats to Fiat
      const sats = parseFloat(price); // In this mode, "price" input is actually sats
      const priceInBtc = sats / 100_000_000;
      const fiatValue = priceInBtc * btcPriceInSelectedCurrency;

      setResult({
        sats: Math.round(sats), // The input sats
        fiat: fiatValue, // The calculated fiat value
        name: itemName || 'Something',
        price: price, // The input sats amount
        currency: currency,
        category: category, // Pass category
        mode: mode,
      });
    }
  }, [btcPrices, price, currency, itemName, mode, category]);

  useEffect(() => {
    if (!isLoading && btcPrices) {
      calculateSats();
    }
  }, [isLoading, btcPrices, calculateSats, mode]);

  const handleSubmit = (event) => {
    event.preventDefault();
    calculateSats();
  };

  const handleAddToList = () => {
    if (result) {
      addItemToList(result);
      // Reset form after adding
      setCategory('');
    }
  };

  return (
    <div className='bg-neutral-900/50 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-white/10'>
      <h2 className='text-2xl font-bold mb-6 text-neutral-100'>
        {mode === 'fiatToSats' ? 'Price an Item' : 'Convert Sats to Fiat'}
      </h2>
      <InputForm
        itemName={itemName}
        setItemName={setItemName}
        price={price}
        setPrice={setPrice}
        currency={currency}
        setCurrency={setCurrency}
        category={category}
        setCategory={setCategory}
        handleSubmit={handleSubmit}
        mode={mode}
        setMode={setMode}
        supportedCurrencies={supportedCurrencies}
        fetchPriceForCurrency={fetchPriceForCurrency}
        itemCategories={itemCategories}
      />
      <ResultDisplay isLoading={isLoading} result={result} mode={mode} />
      <button
        onClick={handleAddToList}
        disabled={!result}
        className='w-full mt-4 bg-neutral-500/20 text-neutral-200 font-bold py-3 px-4 rounded-lg hover:bg-neutral-500/40 transition-colors disabled:bg-neutral-800/50 disabled:text-neutral-500 disabled:cursor-not-allowed'
      >
        Add to List
      </button>
    </div>
  );
}

export default Converter;
