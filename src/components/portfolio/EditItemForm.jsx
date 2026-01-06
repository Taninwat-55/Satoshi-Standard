import React, { useState } from 'react';
import { useSavedItems } from '../../hooks/useSavedItems';

function EditItemForm({ item, onSave, onCancel }) {
  const { supportedCurrencies, fetchPriceForCurrency, itemCategories } = useSavedItems();
  const [itemName, setItemName] = useState(item.name);
  const [price, setPrice] = useState(item.price);
  const [currency, setCurrency] = useState(item.currency);
  const [category, setCategory] = useState(item.category || '');
  const [currentSats, setCurrentSats] = useState(item.currentSats || 0);

  const handleSave = (e) => {
    e.preventDefault();
    if (!itemName.trim() || !price || price <= 0) return;

    onSave({
      ...item,
      name: itemName,
      price: price,
      currency: currency,
      category: category,
      currentSats: currentSats,
    });
  };

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
    <form
      onSubmit={handleSave}
      className='bg-slate-700/80 p-3 rounded-lg w-full'
    >
      <input
        type='text'
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        className='block w-full p-2 mb-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-[#F7931A] focus:border-[#F7931A] transition'
        placeholder='Item Name'
      />
      <div className='flex space-x-2 mb-2'>
        <input
          type='number'
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className='flex-grow w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-[#F7931A] focus:border-[#F7931A] transition'
          placeholder='Price'
          step='0.01'
          min='0'
        />
        <div className='relative'>
          <input
            list='edit-currencies'
            value={currency}
            onChange={handleCurrencyChange}
            className='p-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-[#F7931A] focus:border-[#F7931A] transition w-24 uppercase'
          />
          <datalist id='edit-currencies'>
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

      <div className="mb-2">
        <label className="block text-xs text-slate-400 mb-1">Category</label>
        <input
          type='text'
          list='edit-categories'
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className='block w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-[#F7931A] focus:border-[#F7931A] transition'
          placeholder='Category'
        />
        <datalist id='edit-categories'>
          {itemCategories && itemCategories.map(cat => <option key={cat} value={cat} />)}
        </datalist>
      </div>

      <div className="mb-2 mt-3 pt-3 border-t border-slate-600/50">
        <label className="block text-xs text-[#F7931A] font-bold uppercase tracking-wider mb-2">Stack Progress (Sats)</label>
        <div className="relative">
          <input
            type='number'
            value={currentSats}
            onChange={(e) => setCurrentSats(Number(e.target.value))}
            className='block w-full p-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-[#F7931A] focus:border-[#F7931A] transition font-mono'
            placeholder='0'
            min='0'
          />
          <div className="absolute right-3 top-2.5 text-xs text-slate-500">sats</div>
        </div>
      </div>

      <div className='flex justify-end space-x-2 mt-4'>
        <button
          type='button'
          onClick={onCancel}
          className='px-3 py-1 text-sm rounded-md bg-slate-600 hover:bg-slate-500 transition'
        >
          Cancel
        </button>
        <button
          type='submit'
          className='px-3 py-1 text-sm rounded-md bg-[#F7931A] text-slate-900 font-semibold hover:bg-[#E08318] transition'
        >
          Save
        </button>
      </div>
    </form>
  );
}

export default EditItemForm;