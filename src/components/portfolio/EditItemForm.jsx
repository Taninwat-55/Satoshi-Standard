import React, { useState } from 'react';
import { useSavedItems } from '../../hooks/useSavedItems';
import { FiCheck, FiX } from 'react-icons/fi';

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
    <form onSubmit={handleSave} className='bg-neutral-900/60 border border-white/5 p-4 rounded-xl w-full space-y-3'>
      <input
        type='text'
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        className='glass-input block w-full px-3 py-2 text-sm'
        placeholder='Item Name'
      />

      <div className='flex gap-2'>
        <input
          type='number'
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className='glass-input flex-grow px-3 py-2 text-sm font-mono'
          placeholder='Price'
          step='0.01'
          min='0'
        />
        <div className='relative'>
          <input
            list='edit-currencies'
            value={currency}
            onChange={handleCurrencyChange}
            className='glass-input px-3 py-2 text-sm w-24 uppercase font-bold text-center tracking-wider'
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

      <input
        type='text'
        list='edit-categories'
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className='glass-input block w-full px-3 py-2 text-sm'
        placeholder='Category (optional)'
      />
      <datalist id='edit-categories'>
        {itemCategories && itemCategories.map((cat) => <option key={cat} value={cat} />)}
      </datalist>

      <div className='pt-3 border-t border-white/5'>
        <label className='block text-xs text-brand-orange font-bold uppercase tracking-wider mb-2'>
          Stack Progress (Sats)
        </label>
        <div className='relative'>
          <input
            type='number'
            value={currentSats}
            onChange={(e) => setCurrentSats(Number(e.target.value))}
            className='glass-input block w-full px-3 py-2 text-sm font-mono'
            placeholder='0'
            min='0'
          />
          <span className='absolute right-3 top-2.5 text-xs text-neutral-500'>sats</span>
        </div>
      </div>

      <div className='flex justify-end gap-2 pt-1'>
        <button
          type='button'
          onClick={onCancel}
          className='btn-ghost'
        >
          <FiX size={14} />
          Cancel
        </button>
        <button
          type='submit'
          className='inline-flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wide rounded-lg bg-brand-orange text-white hover:bg-brand-orange-dark transition-all'
        >
          <FiCheck size={14} />
          Save
        </button>
      </div>
    </form>
  );
}

export default EditItemForm;
