import React, { useState } from 'react';
import EditItemForm from './EditItemForm';
import CategoryBreakdown from './CategoryBreakdown';
import PriceChangeBadge from './PriceChangeBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { useSavedItems } from '../../hooks/useSavedItems';

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
    satoshiGoal,
    setSatoshiGoal,
    btcPrices,
  } = useSavedItems();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(satoshiGoal);

  const totalSats = items.reduce((total, item) => total + item.sats, 0);
  const progressPercentage = Math.min((totalSats / satoshiGoal) * 100, 100);

  const handleUpdateGoal = () => {
    setSatoshiGoal(tempGoal);
    setIsEditingGoal(false);
  };

  const fiatTotals = items.reduce((acc, item) => {
    if (!acc[item.currency]) {
      acc[item.currency] = 0;
    }
    acc[item.currency] += parseFloat(item.price);
    return acc;
  }, {});

  return (
    <div className='bg-neutral-900/50 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-white/10 h-full flex flex-col'>
      {/* Category Breakdown Chart */}
      <CategoryBreakdown items={items} />

      {/* Goal Section */}
      <div className='mb-8 p-4 bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 rounded-xl border border-white/5'>
        <div className='flex justify-between items-end mb-2'>
          <h3 className='text-sm font-medium text-neutral-400'>
            Portfolio Goal
          </h3>
          <div className='flex items-center gap-2'>
            {isEditingGoal ? (
              <div className='flex items-center gap-2'>
                <input
                  type='number'
                  value={tempGoal}
                  onChange={(e) => setTempGoal(Number(e.target.value))}
                  className='w-32 bg-neutral-950/50 border border-white/10 rounded px-2 py-1 text-sm text-right text-brand-orange'
                />
                <button
                  onClick={handleUpdateGoal}
                  className='text-xs text-green-400 hover:text-green-300'
                >
                  Save
                </button>
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <span className='text-sm text-neutral-200 font-medium'>
                  {satoshiGoal.toLocaleString()} sats
                </span>
                <button
                  onClick={() => setIsEditingGoal(true)}
                  className='text-xs text-neutral-500 hover:text-brand-orange transition-colors'
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className='relative h-4 bg-neutral-950 rounded-full overflow-hidden border border-white/5'>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className='absolute top-0 left-0 h-full bg-gradient-to-r from-brand-orange to-orange-500 rounded-full'
          />
        </div>
        <div className='flex justify-between items-center mt-2'>
          <span className='text-xs text-brand-orange font-bold'>
            {progressPercentage.toFixed(1)}% Achieved
          </span>
          <span className='text-xs text-neutral-500'>
            {Math.max(0, satoshiGoal - totalSats).toLocaleString()} sats to go
          </span>
        </div>
      </div>

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
                        <div className='text-sm text-[#F7931A] flex items-center gap-2 flex-wrap'>
                          <span>{item.sats.toLocaleString('en-US')} sats</span>
                          <span className='text-slate-400'>
                            ({item.price} {item.currency.toUpperCase()})
                          </span>
                          {item.category && (
                            <span className='inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-neutral-600 text-neutral-200 border border-neutral-500'>
                              {item.category}
                            </span>
                          )}
                          <PriceChangeBadge
                            item={item}
                            currentBtcPrice={
                              btcPrices ? btcPrices[item.currency] : null
                            }
                          />
                        </div>
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
