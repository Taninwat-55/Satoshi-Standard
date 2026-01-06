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
      {/* Mode Toggle */}
      <div className='flex justify-center mb-6'>
        <div className='bg-neutral-950/50 p-1 rounded-full border border-white/10 flex relative'>
          <button
            type='button'
            onClick={() => setMode('fiatToSats')}
            className={`relative z-10 px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${mode === 'fiatToSats' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'}`}
          >
            Fiat → Sats
          </button>
          <button
            type='button'
            onClick={() => setMode('satsToFiat')}
            className={`relative z-10 px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${mode === 'satsToFiat' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'}`}
          >
            Sats → Fiat
          </button>
          {/* Sliding pill background */}
          <div
            className={`absolute top-1 bottom-1 w-[86px] bg-brand-orange rounded-full shadow-lg shadow-orange-500/20 transition-all duration-300 ease-out left-1 ${mode === 'satsToFiat' ? 'translate-x-[90px]' : 'translate-x-0'}`}
          ></div>
        </div>
      </div>

      <div className='space-y-4'>
        <div>
          <label htmlFor='item' className='block text-xs font-medium text-neutral-400 mb-1 ml-1 uppercase tracking-wide'>
            Item Name
          </label>
          <input
            type='text'
            id='item'
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className='glass-input block w-full p-4 text-lg'
            placeholder="e.g. Weekly Groceries"
          />
        </div>

        <div className='grid grid-cols-[1.5fr_1fr] gap-4'>
          <div>
            <label htmlFor='price' className='block text-xs font-medium text-neutral-400 mb-1 ml-1 uppercase tracking-wide'>
              {mode === 'fiatToSats' ? 'Price' : 'Sats'}
            </label>
            <input
              type='number'
              id='price'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className='glass-input block w-full p-4 text-lg font-mono'
              placeholder={mode === 'fiatToSats' ? '0.00' : '1000'}
              step={mode === 'fiatToSats' ? '0.01' : '1'}
              min='0'
            />
          </div>
          <div>
            <label htmlFor='currency' className='block text-xs font-medium text-neutral-400 mb-1 ml-1 uppercase tracking-wide'>
              {mode === 'fiatToSats' ? 'Currency' : 'Target'}
            </label>
            <input
              list='currencies'
              id='currency'
              value={currency}
              onChange={handleCurrencyChange}
              className='glass-input block w-full p-4 text-lg uppercase font-bold text-center tracking-wider'
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

        <div>
          <label htmlFor='category' className='block text-xs font-medium text-neutral-400 mb-1 ml-1 uppercase tracking-wide'>
            Category (Optional)
          </label>
          <input
            type='text'
            id='category'
            list='category-suggestions'
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className='glass-input block w-full p-4'
            placeholder='Select or type...'
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
    </form>
  );
}

export default InputForm;
