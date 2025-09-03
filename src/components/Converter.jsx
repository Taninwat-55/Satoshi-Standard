import React, { useState, useEffect, useCallback } from 'react';
import InputForm from './InputForm';
import ResultDisplay from './ResultDisplay';
import { useSavedItems } from '../hooks/useSavedItems';

function Converter({ btcPrices, isLoading }) {
  const { addItemToList } = useSavedItems();
  const [itemName, setItemName] = useState('A cup of coffee');
  const [price, setPrice] = useState('4');
  const [currency, setCurrency] = useState('usd');
  const [result, setResult] = useState(null);

  const calculateSats = useCallback(() => {
    if (!btcPrices || !price || isNaN(price) || price <= 0) {
      setResult(null);
      return;
    }

    const btcPriceInSelectedCurrency = btcPrices[currency];
    const priceInBtc = parseFloat(price) / btcPriceInSelectedCurrency;
    const priceInSats = priceInBtc * 100_000_000;

    setResult({
      sats: Math.round(priceInSats),
      name: itemName || 'Something',
      price: price,
      currency: currency,
    });
  }, [btcPrices, price, currency, itemName]);

  useEffect(() => {
    if (!isLoading && btcPrices) {
      calculateSats();
    }
  }, [isLoading, btcPrices, calculateSats]);

  const handleSubmit = (event) => {
    event.preventDefault();
    calculateSats();
  };

  const handleAddToList = () => {
    if (result) {
      addItemToList(result);
    }
  };

  return (
    <div className='bg-neutral-900/50 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-white/10'>
      <h2 className='text-2xl font-bold mb-6 text-neutral-100'>
        Price an Item
      </h2>
      <InputForm
        itemName={itemName}
        setItemName={setItemName}
        price={price}
        setPrice={setPrice}
        currency={currency}
        setCurrency={setCurrency}
        handleSubmit={handleSubmit}
      />
      <ResultDisplay isLoading={isLoading} result={result} />
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
