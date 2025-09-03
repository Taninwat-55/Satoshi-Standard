import React, { useState } from 'react';

function EditItemForm({ item, onSave, onCancel }) {
  const [itemName, setItemName] = useState(item.name);
  const [price, setPrice] = useState(item.price);
  const [currency, setCurrency] = useState(item.currency);

  const handleSave = (e) => {
    e.preventDefault();
    if (!itemName.trim() || !price || price <= 0) return;

    onSave({
      ...item,
      name: itemName,
      price: price,
      currency: currency,
    });
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
      <div className='flex space-x-2'>
        <input
          type='number'
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className='flex-grow w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-[#F7931A] focus:border-[#F7931A] transition'
          placeholder='Price'
          step='0.01'
          min='0'
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className='p-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-[#F7931A] focus:border-[#F7931A] transition'
        >
          <option value='usd'>USD</option>
          <option value='eur'>EUR</option>
          <option value='sek'>SEK</option>
          <option value='dkk'>DKK</option>
          <option value='thb'>THB</option>
        </select>
      </div>
      <div className='flex justify-end space-x-2 mt-3'>
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