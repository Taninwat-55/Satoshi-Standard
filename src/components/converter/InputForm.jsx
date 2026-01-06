function InputForm({
  itemName,
  setItemName,
  price,
  setPrice,
  currency,
  setCurrency,
  category,
  setCategory,
  handleSubmit,
  mode,
  setMode,
  supportedCurrencies,
  fetchPriceForCurrency,
  itemCategories,
}) {
  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value.toLowerCase();
    setCurrency(newCurrency);
    if (
      supportedCurrencies &&
      supportedCurrencies.includes(newCurrency) &&
      fetchPriceForCurrency
    ) {
      fetchPriceForCurrency(newCurrency);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      <div className='flex justify-end'>
        <button
          type='button'
          onClick={() =>
            setMode(mode === 'fiatToSats' ? 'satsToFiat' : 'fiatToSats')
          }
          className='text-xs font-medium text-brand-orange hover:text-orange-400 transition-colors flex items-center gap-2 bg-white/5 py-1.5 px-3 rounded-full border border-white/10 hover:bg-white/10'
        >
          <span className={mode === 'fiatToSats' ? 'underline' : ''}>
            Fiat → Sats
          </span>
          <span className='text-neutral-500'>|</span>
          <span className={mode === 'satsToFiat' ? 'underline' : ''}>
            Sats → Fiat
          </span>
        </button>
      </div>

      <div>
        <label
          htmlFor='item'
          className='block text-sm font-medium text-neutral-300'
        >
          Item Name
        </label>
        <input
          type='text'
          id='item'
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className='mt-1 block w-full p-3 bg-neutral-950/50 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition'
        />
      </div>

      <div>
        <label
          htmlFor='category'
          className='block text-sm font-medium text-neutral-300'
        >
          Category (Optional)
        </label>
        <div className='relative'>
          <input
            type='text'
            id='category'
            list='category-suggestions'
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className='mt-1 block w-full p-3 bg-neutral-950/50 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition'
            placeholder='e.g., Food, Tech, Transport'
          />
          <datalist id='category-suggestions'>
            {itemCategories && itemCategories.map(cat => <option key={cat} value={cat} />)}
            <option value="Food" />
            <option value="Tech" />
            <option value="Transport" />
            <option value="Entertainment" />
            <option value="Utilities" />
          </datalist>
        </div>
      </div>

      <div className='flex space-x-4'>
        <div className='flex-grow'>
          <label
            htmlFor='price'
            className='block text-sm font-medium text-neutral-300'
          >
            {mode === 'fiatToSats' ? 'Price' : 'Amount (Sats)'}
          </label>
          <input
            type='number'
            id='price'
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className='mt-1 block w-full p-3 bg-neutral-950/50 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition'
            placeholder={mode === 'fiatToSats' ? '0.00' : '1000'}
            step={mode === 'fiatToSats' ? '0.01' : '1'}
            min='0'
          />
        </div>
        <div>
          <label
            htmlFor='currency'
            className='block text-sm font-medium text-neutral-300'
          >
            {mode === 'fiatToSats' ? 'Currency' : 'Target Currency'}
          </label>
          <div className='relative'>
            <input
              list='currencies'
              id='currency'
              value={currency}
              onChange={handleCurrencyChange}
              className='mt-1 block w-full p-3 bg-neutral-950/50 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition h-full uppercase'
            />
            <datalist id='currencies'>
              {supportedCurrencies &&
                supportedCurrencies.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))}
              {!supportedCurrencies ||
                (supportedCurrencies.length === 0 && (
                  <>
                    <option value='usd'>USD</option>
                    <option value='eur'>EUR</option>
                    <option value='sek'>SEK</option>
                    <option value='dkk'>DKK</option>
                    <option value='thb'>THB</option>
                  </>
                ))}
            </datalist>
          </div>
        </div>
      </div>
      <button
        type='submit'
        className='w-full bg-gradient-to-r from-brand-orange to-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity shadow-lg'
      >
        {mode === 'fiatToSats'
          ? 'Calculate in Satoshis'
          : 'Calculate Fiat Value'}
      </button>
    </form>
  );
}

export default InputForm;
