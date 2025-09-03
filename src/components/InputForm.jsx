function InputForm({
  itemName,
  setItemName,
  price,
  setPrice,
  currency,
  setCurrency,
  handleSubmit,
}) {
  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
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
      <div className='flex space-x-4'>
        <div className='flex-grow'>
          <label
            htmlFor='price'
            className='block text-sm font-medium text-neutral-300'
          >
            Price
          </label>
          <input
            type='number'
            id='price'
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className='mt-1 block w-full p-3 bg-neutral-950/50 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition'
            placeholder='0.00'
            step='0.01'
            min='0'
          />
        </div>
        <div>
          <label
            htmlFor='currency'
            className='block text-sm font-medium text-neutral-300'
          >
            Currency
          </label>
          <select
            id='currency'
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className='mt-1 block w-full p-3 bg-neutral-950/50 border border-white/10 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition h-full'
          >
            <option value='usd'>USD</option>
            <option value='eur'>EUR</option>
            <option value='sek'>SEK</option>
            <option value='dkk'>DKK</option>
            <option value='thb'>THB</option>
          </select>
        </div>
      </div>
      <button
        type='submit'
        className='w-full bg-gradient-to-r from-brand-orange to-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity shadow-lg'
      >
        Calculate in Satoshis
      </button>
    </form>
  );
}

export default InputForm;
