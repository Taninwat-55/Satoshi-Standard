function InputForm({ itemName, setItemName, price, setPrice, currency, setCurrency, handleSubmit }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="item" className="block text-sm font-medium text-slate-300">Item Name</label>
        <input type="text" id="item" value={itemName} onChange={(e) => setItemName(e.target.value)} className="mt-1 block w-full p-3 bg-slate-900 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F7931A] focus:border-[#F7931A] transition" />
      </div>
      <div className="flex space-x-4">
        <div className="flex-grow">
          <label htmlFor="price" className="block text-sm font-medium text-slate-300">Price</label>
          <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full p-3 bg-slate-900 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F7931A] focus:border-[#F7931A] transition" placeholder="0.00" step="0.01" min="0" />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-slate-300">Currency</label>
          <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1 block w-full p-3 bg-slate-900 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F7931A] focus:border-[#F7931A] transition">
            <option value="usd">USD</option>
            <option value="eur">EUR</option>
            <option value="sek">SEK</option>
            <option value="dkk">DKK</option>
            <option value="thb">THB</option>
          </select>
        </div>
      </div>
      <button type="submit" className="w-full bg-[#F7931A] text-slate-900 font-bold py-3 px-4 rounded-lg hover:bg-[#E08318] transition-colors shadow-md">Calculate in Satoshis</button>
    </form>
  );
}

export default InputForm;