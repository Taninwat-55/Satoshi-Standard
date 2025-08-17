function SavedItemsList({ items, removeItem, clearList, onCompare }) {
  const totalSats = items.reduce((total, item) => total + item.sats, 0);
  const fiatTotals = items.reduce((acc, item) => {
    if (!acc[item.currency]) {
      acc[item.currency] = 0;
    }
    acc[item.currency] += parseFloat(item.price);
    return acc;
  }, {});

  return (
    <div className='bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 h-full flex flex-col'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold text-white'>Saved List</h2>
        {items.length > 0 && (
          <button
            onClick={clearList}
            className='text-sm text-slate-400 hover:text-red-400 transition'
          >
            Clear All
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <div className='text-slate-500 text-center flex-grow flex items-center justify-center'>
          <p>Your list is empty.</p>
        </div>
      ) : (
        <>
          <div className='space-y-3 overflow-y-auto flex-grow pr-2 -mr-2'>
            {items.map((item) => (
              <div
                key={item.id}
                className='bg-slate-700/50 p-3 rounded-lg flex justify-between items-center'
              >
                <div>
                  <p className='font-semibold text-white'>{item.name}</p>
                  <p className='text-sm text-[#F7931A]'>
                    {item.sats.toLocaleString('en-US')} sats{' '}
                    <span className='text-slate-400 ml-2'>
                      ({item.price} {item.currency.toUpperCase()})
                    </span>
                  </p>
                </div>
                <div className='flex items-center space-x-3'>
                  <button
                    onClick={() => onCompare(item)}
                    title='Compare price with 30 days ago'
                    className='text-slate-400 hover:text-white text-xs transition'
                  >
                    Compare
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className='text-slate-500 hover:text-red-400 text-xl font-bold transition'
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className='mt-6 border-t border-slate-700 pt-4'>
            <h3 className='text-lg font-bold text-white'>Total</h3>
            <div className='text-[#F7931A] text-2xl font-bold'>
              {totalSats.toLocaleString('en-US')} sats
            </div>
            <div className='text-slate-400 text-sm'>
              {Object.entries(fiatTotals).map(([currency, total]) => (
                <span key={currency} className='mr-4'>
                  {total.toFixed(2)} {currency.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SavedItemsList;
