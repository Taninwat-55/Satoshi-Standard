import React, { useState, useEffect, useCallback } from 'react';
import InputForm from './InputForm';
import ResultDisplay from './ResultDisplay';

function Converter({ btcPrices, isLoading, addItemToList }) {
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
    <div className='bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700'>
      <h2 className='text-2xl font-bold mb-6 text-white'>Price an Item</h2>
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
        className='w-full mt-4 bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed'
      >
        Add to List
      </button>
    </div>
  );
}

export default Converter;
