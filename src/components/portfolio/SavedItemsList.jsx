import React, { useState } from 'react';
import EditItemForm from './EditItemForm';
import CategoryBreakdown from './CategoryBreakdown';
import FiatLeakChart from './FiatLeakChart';
import PriceChangeBadge from './PriceChangeBadge';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useSavedItems } from '../../hooks/useSavedItems';
import { availableProviders } from '../../api/cryptoApi';
import DataTools from './DataTools';
import { FiSearch, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { FaChartLine, FaBitcoin } from 'react-icons/fa';
import { useCurrencyPreference } from '../../contexts/CurrencyPreferenceContext';
import { convertCurrency, formatCurrency } from '../../lib/currencies';

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
    priceSource,
    setPriceSource,
    satsMode,
  } = useSavedItems();
  const { preferredCurrency } = useCurrencyPreference();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(satoshiGoal);
  const [searchQuery, setSearchQuery] = useState('');

  const handleUpdateGoal = () => {
    setSatoshiGoal(tempGoal);
    setIsEditingGoal(false);
  };

  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      (item.category && item.category.toLowerCase().includes(query)) ||
      item.currency.toLowerCase().includes(query)
    );
  });

  const totalSats = filteredItems.reduce((total, item) => total + item.sats, 0);
  const progressPercentage = Math.min((totalSats / satoshiGoal) * 100, 100);

  const totalFiatInPreferred = !satsMode && btcPrices
    ? filteredItems.reduce((total, item) => {
        return total + convertCurrency(parseFloat(item.price), item.currency, preferredCurrency, btcPrices);
      }, 0)
    : 0;

  return (
    <div className='h-full flex flex-col space-y-6 overflow-y-auto pb-6 scrollbar-hide'>
      {/* Top Row: Goal & Charts */}
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
        {/* Widget 1: Portfolio Goal */}
        <div className='glass-panel p-6 relative overflow-hidden'>
          <div className='absolute top-0 right-0 p-4 opacity-10'>
            <svg className="w-24 h-24 text-brand-orange" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2v2h1c.55 0 1 .45 1 1v3H9.5L5.47 5.09A7.974 7.974 0 0112 4c4.41 0 8 3.59 8 8 0 1.99-.73 3.82-1.92 5.23z" /></svg>
          </div>

          <div className='flex justify-between items-start mb-4 relative z-10'>
            <h3 className='section-title'>Portfolio Goal</h3>
            <div className='flex items-center gap-2'>
              {isEditingGoal ? (
                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    value={tempGoal}
                    onChange={(e) => setTempGoal(Number(e.target.value))}
                    className='glass-input w-24 px-2 py-1 text-sm text-right text-brand-orange'
                  />
                  <button onClick={handleUpdateGoal} className='btn-icon text-green-400 hover:text-green-300 hover:bg-green-500/10'><FiCheck size={14} /></button>
                </div>
              ) : (
                <button onClick={() => setIsEditingGoal(true)} className='btn-ghost'>Edit</button>
              )}
            </div>
          </div>

          <div className='relative z-10'>
            <div className='text-3xl font-bold text-white mb-1'>
              {(progressPercentage).toFixed(1)}% <span className='text-lg font-medium text-neutral-500'>Achieved</span>
            </div>
            <div className='text-sm text-neutral-400 mb-6'>
              {totalSats.toLocaleString()} / {satoshiGoal.toLocaleString()} sats
            </div>

            <Progress value={progressPercentage} />
          </div>
        </div>

        {/* Widget 2: Category Breakdown */}
        <div className='glass-panel p-6 flex flex-col justify-center'>
          <h3 className='section-title mb-4'>Allocation</h3>
          <div className='flex-grow flex items-center justify-center h-40'>
            <CategoryBreakdown items={filteredItems} />
          </div>
        </div>
      </div>

      {/* Global Chart: Purchasing Power */}
      <div className='glass-panel p-6'>
        <FiatLeakChart currency={preferredCurrency} />
      </div>

      {/* Saved List Widget */}
      <div className='glass-panel flex-grow flex flex-col min-h-[500px]'>
        {/* Toolbar */}
        <div className='p-6 border-b border-white/5 flex flex-col xl:flex-row xl:items-center justify-between gap-6'>
          <div className='flex items-center gap-4 flex-wrap'>
            <h2 className='text-xl font-bold text-white flex items-center gap-2 shrink-0'>
              Dashboard
              <span className='px-2 py-0.5 bg-neutral-800 text-neutral-400 text-xs rounded-full font-medium'>{items.length}</span>
            </h2>

            <div className='flex bg-neutral-950/50 p-1 rounded-lg border border-white/5'>
              {availableProviders.map(provider => (
                <button
                  key={provider.id}
                  onClick={() => setPriceSource(provider.id)}
                  className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${priceSource === provider.id
                    ? 'bg-neutral-800 text-brand-orange shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                >
                  {provider.name}
                </button>
              ))}
            </div>
          </div>

          <div className='flex items-center gap-3 flex-wrap'>
            <div className='relative'>
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
              <input
                type='text'
                placeholder='Search...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-8 pr-4 py-2 bg-neutral-950/50 border border-white/10 rounded-lg text-sm text-white focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all w-full sm:w-48'
              />
            </div>
            <select
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value)}
              className='px-3 py-2 bg-neutral-950/50 border border-white/10 rounded-lg text-sm text-neutral-300 focus:ring-1 focus:ring-brand-orange focus:border-brand-orange cursor-pointer'
            >
              <option value='dateAdded-desc'>Newest</option>
              <option value='dateAdded-asc'>Oldest</option>
              <option value='sats-desc'>Price (High)</option>
              <option value='sats-asc'>Price (Low)</option>
              <option value='name-asc'>A-Z</option>
            </select>
            {items.length > 0 && (
              <button onClick={clearList} className='btn-danger'>
                Clear
              </button>
            )}
            <div className="border-l border-white/10 pl-3 ml-1">
              <DataTools />
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className='flex-grow overflow-y-auto p-4 space-y-2'>
          <AnimatePresence>
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='h-48 flex flex-col items-center justify-center gap-3 text-center'
              >
                <div className='w-14 h-14 rounded-full bg-brand-orange/10 flex items-center justify-center'>
                  <FaBitcoin className='text-brand-orange text-2xl' />
                </div>
                <div>
                  <p className='text-neutral-300 font-medium'>No items yet</p>
                  <p className='text-neutral-500 text-sm mt-1'>Add something from the converter to get started.</p>
                </div>
              </motion.div>
            ) : filteredItems.length === 0 ? (
              <div className='h-32 flex items-center justify-center text-neutral-500 text-sm'>
                No items match your search.
              </div>
            ) : (
              filteredItems.map((item) => {
                const convertedPrice = btcPrices
                  ? convertCurrency(parseFloat(item.price), item.currency, preferredCurrency, btcPrices)
                  : parseFloat(item.price);
                const showOriginal = item.currency !== preferredCurrency && !!btcPrices;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className='group bg-neutral-900/30 hover:bg-neutral-800/40 border border-transparent hover:border-white/5 rounded-xl p-4 transition-all duration-200'
                  >
                    {editingId === item.id ? (
                      <EditItemForm
                        item={item}
                        onSave={onUpdateItem}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                        <div className='flex items-start gap-4'>
                          <div className='w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-lg shrink-0'>
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className='font-bold text-white text-base'>{item.name}</h4>
                            <div className='flex items-center gap-2 mt-1 text-xs text-neutral-500'>
                              <span>{new Date(item.dateAdded).toLocaleDateString()}</span>
                              {item.category && (
                                <>
                                  <span>•</span>
                                  <Badge variant='default'>{item.category}</Badge>
                                </>
                              )}
                            </div>

                            {/* Stacking Progress */}
                            <div className='w-full mt-3'>
                              <div className='flex justify-between text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1'>
                                <span>Progress</span>
                                <span>{Math.min(((item.currentSats || 0) / item.sats) * 100, 100).toFixed(0)}%</span>
                              </div>
                              <div className='h-1.5 bg-neutral-800 rounded-full overflow-hidden'>
                                <div
                                  className='h-full bg-brand-orange transition-all duration-500'
                                  style={{ width: `${Math.min(((item.currentSats || 0) / item.sats) * 100, 100)}%` }}
                                />
                              </div>
                              <div className='text-[10px] text-neutral-400 mt-1 text-right'>
                                Stacked: <span className='text-neutral-300 font-mono'>{(item.currentSats || 0).toLocaleString()}</span> sats
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className='flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-4 sm:mt-0'>
                          <div className='text-right'>
                            <div className='text-brand-orange font-bold font-mono text-lg tracking-tight'>
                              {item.sats.toLocaleString()} <span className='text-xs text-neutral-600 font-sans font-medium'>sats</span>
                            </div>
                            <div className='flex items-center justify-end gap-2 mt-0.5'>
                              {!satsMode && (
                                <span className='text-xs text-neutral-400'>
                                  {formatCurrency(convertedPrice, preferredCurrency)}
                                  {showOriginal && (
                                    <span className='text-neutral-600 ml-1'>
                                      ({item.price} {item.currency.toUpperCase()})
                                    </span>
                                  )}
                                </span>
                              )}
                              <PriceChangeBadge item={item} currentBtcPrice={btcPrices ? btcPrices[item.currency] : null} />
                            </div>
                          </div>

                          <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <button onClick={() => onCompare(item)} className='btn-icon' title='Compare'>
                              <FaChartLine size={14} />
                            </button>
                            <button onClick={() => setEditingId(item.id)} className='btn-icon' title='Edit'>
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              onClick={() => removeItemFromList(item.id)}
                              className='btn-icon hover:text-red-400 hover:bg-red-500/10'
                              title='Delete'
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Footer Totals */}
        <div className='p-6 border-t border-white/5 bg-black/20 flex items-end justify-between'>
          <p className='data-label'>Portfolio</p>
          <div className='text-right'>
            <div className='text-3xl font-bold text-white tabular-nums'>
              {totalSats.toLocaleString()} <span className='text-lg font-medium text-brand-orange'>sats</span>
            </div>
            {!satsMode && totalFiatInPreferred > 0 && (
              <p className='text-sm text-neutral-500 mt-0.5'>
                ≈ {formatCurrency(totalFiatInPreferred, preferredCurrency)} {preferredCurrency.toUpperCase()}
              </p>
            )}
            {satsMode && <p className='text-xs text-brand-orange/50 italic mt-1'>Sats-Only Mode Active</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SavedItemsList;
