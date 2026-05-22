import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import { Toaster } from 'react-hot-toast';
import Converter from './components/converter/Converter';
import SavedItemsList from './components/portfolio/SavedItemsList';
import HistoricalPriceModal from './components/shared/HistoricalPriceModal';
import {
  fetchBitcoinPriceHistoryRange,
  fetchBitcoinPrices,
  fetchSupportedCurrencies,
} from './api/cryptoApi';
import { FaBitcoin } from 'react-icons/fa';
import { SavedItemsProvider } from './contexts/SavedItemsProvider';
import { AuthProvider } from './contexts/AuthContext';
import FeeTicker from './components/layout/FeeTicker';
import LightningTip from './components/layout/LightningTip';
import AiChat from './components/ai/AiChat';
import AddressWatcher from './components/address/AddressWatcher';
import { motion, AnimatePresence } from 'framer-motion';
import SatsToggle from './components/layout/SatsToggle';
import CurrencySelector from './components/shared/CurrencySelector';
// Auth & Stripe components - uncomment when Supabase is ready
// import AuthModal from './components/auth/AuthModal';
// import UserMenu from './components/auth/UserMenu';
// import PricingModal from './components/subscription/PricingModal';

export default function App() {
  const [btcPrices, setBtcPrices] = useState(null);
  const [supportedCurrencies, setSupportedCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [historyCache, setHistoryCache] = useState({});
  const [modalItem, setModalItem] = useState(null);
  const [timeRange, setTimeRange] = useState(30);
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' | 'watcher'

  // Auth & Pricing modals - disabled until Supabase is configured
  // const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  useEffect(() => {
    async function initData() {
      setIsLoading(true);
      const [prices, currencies] = await Promise.all([
        fetchBitcoinPrices(),
        fetchSupportedCurrencies(),
      ]);
      setBtcPrices(prices);
      setSupportedCurrencies(currencies);
      setIsLoading(false);
    }
    initData();
  }, []);

  const fetchPriceForCurrency = useCallback(
    async (currency) => {
      if (btcPrices && btcPrices[currency]) return;
      const prices = await fetchBitcoinPrices(currency);
      if (prices) {
        setBtcPrices((prev) => ({ ...prev, ...prices }));
      }
    },
    [btcPrices]
  );

  useEffect(() => {
    if (!modalItem) return;
    const fetchHistory = async () => {
      setIsModalLoading(true);
      setModalData(null);
      const cacheKey = `${modalItem.currency}-${timeRange}`;
      let priceHistory = historyCache[cacheKey];

      if (!priceHistory) {
        priceHistory = await fetchBitcoinPriceHistoryRange(modalItem.currency, timeRange);
        if (priceHistory) {
          setHistoryCache((prev) => ({ ...prev, [cacheKey]: priceHistory }));
        }
      }

      if (priceHistory && btcPrices) {
        const chartData = priceHistory.map(([timestamp, btcPrice]) => ({
          date: new Date(timestamp).toLocaleDateString(),
          sats: Math.round((parseFloat(modalItem.price) / btcPrice) * 100_000_000),
        }));
        setModalData({ itemName: modalItem.name, chartData, timeRange });
      } else {
        setModalData({ error: 'Could not fetch historical data.' });
      }
      setIsModalLoading(false);
    };
    fetchHistory();
  }, [modalItem, timeRange, btcPrices, historyCache]);

  const handleComparePrice = useCallback((item) => {
    setTimeRange(30);
    setModalItem(item);
    setIsModalOpen(true);
  }, []);

  return (
    <AuthProvider>
      <SkeletonTheme baseColor='#1a1a1a' highlightColor='#2a2a2a'>
        <div className='bg-neutral-950 text-neutral-200 min-h-screen font-sans antialiased relative isolate overflow-hidden selection:bg-brand-orange selection:text-white'>
          {/* Ambient Background Blobs */}
          <div className='absolute top-0 -left-64 w-[500px] h-[500px] bg-orange-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-[blob_10s_infinite]'></div>
          <div className='absolute top-0 -right-64 w-[500px] h-[500px] bg-purple-900/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-[blob_10s_infinite] [animation-delay:2s]'></div>
          <div className='absolute -bottom-64 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sky-900/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-[blob_10s_infinite] [animation-delay:4s]'></div>

          <Toaster
            position='bottom-right'
            reverseOrder={false}
            toastOptions={{
              style: {
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(10px)',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
            }}
          />

          <div className='relative z-10 max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 h-screen flex flex-col'>
            <SavedItemsProvider
              btcPrices={btcPrices}
              supportedCurrencies={supportedCurrencies}
              fetchPriceForCurrency={fetchPriceForCurrency}
            >
              {/* Header */}
              <header className='flex items-center justify-between mb-8 pb-6 border-b border-white/5'>
                <div className='flex items-center gap-4'>
                  <div className='bg-gradient-to-br from-brand-orange to-brand-orange-dark p-2 rounded-xl shadow-lg shadow-orange-500/20'>
                    <FaBitcoin className='text-3xl text-white' />
                  </div>
                  <div>
                    <h1 className='text-2xl font-bold text-white tracking-tight leading-none'>Satoshi Standard</h1>
                    <p className='text-xs text-neutral-400 font-medium tracking-wide uppercase'>Bitcoin Unit Converter</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CurrencySelector />
                  <SatsToggle />
                  <FeeTicker />
                  {/* UserMenu - uncomment when Supabase is ready */}
                  {/* <UserMenu
                    onOpenAuth={() => setIsAuthModalOpen(true)}
                    onOpenPricing={() => setIsPricingModalOpen(true)}
                  /> */}
                </div>
              </header>

              {/* Dashboard Grid */}
              <main className='flex-grow grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 overflow-hidden'>
                {/* Left Panel: Converter */}
                <aside className='lg:h-full lg:overflow-y-auto pr-1'>
                  <div className='glass-panel p-6 sticky top-0'>
                    <h2 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                      <span className='w-1 h-6 bg-brand-orange rounded-full'></span>
                      Converter
                    </h2>
                    <Converter
                      btcPrices={btcPrices}
                      isLoading={isLoading}
                      supportedCurrencies={supportedCurrencies}
                      fetchPriceForCurrency={fetchPriceForCurrency}
                    />
                  </div>
                </aside>

                {/* Right Panel: Portfolio / Address Watcher */}
                <section className='lg:h-full lg:overflow-hidden flex flex-col gap-3'>

                  {/* Tab Bar */}
                  <div className='flex items-center gap-1 bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shrink-0 self-start'>
                    {[
                      { id: 'portfolio', label: 'Portfolio' },
                      { id: 'watcher', label: 'Address Watcher' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200
                          ${activeTab === tab.id ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                      >
                        {activeTab === tab.id && (
                          <motion.span
                            layoutId='tab-indicator'
                            className='absolute inset-0 bg-brand-orange/20 border border-brand-orange/40 rounded-xl'
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                          />
                        )}
                        <span className='relative z-10'>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <AnimatePresence mode='wait'>
                    {activeTab === 'portfolio' ? (
                      <motion.div
                        key='portfolio'
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className='flex-grow overflow-hidden flex flex-col'
                      >
                        <SavedItemsList onCompare={handleComparePrice} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key='watcher'
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className='flex-grow overflow-y-auto'
                      >
                        <AddressWatcher btcPrices={btcPrices} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                </section>
              </main>
              <AiChat />
            </SavedItemsProvider>
          </div>

          {isModalOpen && (
            <HistoricalPriceModal
              isLoading={isModalLoading}
              data={modalData}
              onClose={() => setIsModalOpen(false)}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
            />
          )}

          {/* Auth & Pricing Modals - uncomment when Supabase is ready */}
          {/* <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          /> */}

          {/* <PricingModal
            isOpen={isPricingModalOpen}
            onClose={() => setIsPricingModalOpen(false)}
          /> */}

          <LightningTip />
        </div>
      </SkeletonTheme>
    </AuthProvider>
  );
}
