import EditItemForm from './EditItemForm';
import { motion, AnimatePresence } from 'framer-motion';
import { useSavedItems } from '../hooks/useSavedItems';

function SavedItemsList({ onCompare }) {
  const {
    items,
    removeItemFromList,
    clearList,
    editingId,
    setEditingId,
    onUpdateItem,
    sortCriteria,
    setSortCriteria,
  } = useSavedItems();
  const totalSats = items.reduce((total, item) => total + item.sats, 0);
  const fiatTotals = items.reduce((acc, item) => {
    if (!acc[item.currency]) {
      acc[item.currency] = 0;
    }
    acc[item.currency] += parseFloat(item.price);
    return acc;
  }, {});

  return (
    <div className='bg-neutral-900/50 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-white/10 h-full flex flex-col'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold text-neutral-100'>Saved List</h2>
        <div className='flex items-center space-x-4'>
          {/* Sort Dropdown */}
          {items.length > 1 && (
            <div className='flex items-center space-x-2'>
              <label htmlFor='sort' className='text-sm text-slate-400'>
                Sort by:
              </label>
              <select
                id='sort'
                value={sortCriteria}
                onChange={(e) => setSortCriteria(e.target.value)}
                className='p-1 text-sm bg-neutral-800/60 border border-white/10 rounded-md text-neutral-200 focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition'
              >
                <option value='dateAdded-desc'>Date (Newest)</option>
                <option value='dateAdded-asc'>Date (Oldest)</option>
                <option value='sats-desc'>Price (High-Low)</option>
                <option value='sats-asc'>Price (Low-High)</option>
                <option value='name-asc'>Name (A-Z)</option>
                <option value='name-desc'>Name (Z-A)</option>
              </select>
            </div>
          )}

          {/* Clear All Button */}
          {items.length > 0 && (
            <button
              onClick={clearList}
              className='text-sm text-slate-400 hover:text-red-400 transition'
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className='text-slate-500 text-center flex-grow flex items-center justify-center'>
          <p>Your list is empty.</p>
        </div>
      ) : (
        <>
          <div className='space-y-3 overflow-y-auto flex-grow pr-2 -mr-2'>
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                >
                  {editingId === item.id ? (
                    <EditItemForm
                      item={item}
                      onSave={onUpdateItem}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className='bg-slate-700/50 p-3 rounded-lg flex justify-between items-center'>
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
                          onClick={() => setEditingId(item.id)}
                          title='Edit item'
                          className='text-slate-400 hover:text-white text-xs transition'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onCompare(item)}
                          title='Compare price with 30 days ago'
                          className='text-slate-400 hover:text-white text-xs transition'
                        >
                          Compare
                        </button>
                        <button
                          onClick={() => removeItemFromList(item.id)}
                          className='text-slate-500 hover:text-red-400 text-xl font-bold transition'
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {/* Totals Section */}
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
