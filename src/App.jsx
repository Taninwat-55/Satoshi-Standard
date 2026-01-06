import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import { Toaster } from 'react-hot-toast';
import Converter from './components/converter/Converter';
import SavedItemsList from './components/portfolio/SavedItemsList';
import HistoricalPriceModal from './components/shared/HistoricalPriceModal';
import {
  fetchBitcoinHistoricalPrice,
  fetchBitcoinPriceHistoryRange,
  fetchBitcoinPrices,
  fetchSupportedCurrencies,
} from './api/cryptoApi';
import { FaBitcoin } from 'react-icons/fa';
import { SavedItemsProvider } from './contexts/SavedItemsProvider';

function App() {
  const [btcPrices, setBtcPrices] = useState(null);
  const [supportedCurrencies, setSupportedCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [historyCache, setHistoryCache] = useState({});
  const [modalItem, setModalItem] = useState(null); 
  const [timeRange, setTimeRange] = useState(30); 

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
        console.log(
          `Fetching new history for ${modalItem.currency.toUpperCase()} (${timeRange} days)...`
        );
        priceHistory = await fetchBitcoinPriceHistoryRange(
          modalItem.currency,
          timeRange
        );

        if (priceHistory) {
          setHistoryCache((prevCache) => ({
            ...prevCache,
            [cacheKey]: priceHistory,
          }));
        }
      } else {
        console.log(
          `Using cached history for ${modalItem.currency.toUpperCase()} (${timeRange} days).`
        );
      }

      if (priceHistory && btcPrices) {
        const chartData = priceHistory.map(([timestamp, btcPrice]) => {
          const sats = (parseFloat(modalItem.price) / btcPrice) * 100_000_000;
          return {
            date: new Date(timestamp).toLocaleDateString(),
            sats: Math.round(sats),
          };
        });

        // Add today's price to the end of the chart data
        const currentBtcPrice = btcPrices[modalItem.currency.toLowerCase()];
        const currentSats =
          (parseFloat(modalItem.price) / currentBtcPrice) * 100_000_000;

        // Ensure we don't duplicate the last entry if the API includes today
        const lastApiDate = new Date(
          priceHistory[priceHistory.length - 1][0]
        ).toLocaleDateString();
        if (lastApiDate !== new Date().toLocaleDateString()) {
          chartData.push({
            date: new Date().toLocaleDateString(),
            sats: Math.round(currentSats),
          });
        }

        setModalData({
          itemName: modalItem.name,
          chartData: chartData,
          timeRange: timeRange,
        });
      } else {
        setModalData({
          error: 'Could not fetch historical data for this item.',
        });
      }
      setIsModalLoading(false);
    };

    fetchHistory();
  }, [modalItem, timeRange, btcPrices, historyCache]);

  const handleComparePrice = useCallback((item) => {
    setTimeRange(30); // Reset to default 30 days when opening
    setModalItem(item);
    setIsModalOpen(true);
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setModalItem(null); // Clear the item when modal closes
  };

  return (
    <SkeletonTheme baseColor='#1a1a1a' highlightColor='#2a2a2a'>
      <div className='bg-neutral-950 text-neutral-200 min-h-screen font-sans antialiased relative isolate overflow-hidden'>
        <div className='absolute top-0 -left-4 w-72 h-72 bg-orange-900 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-[blob_7s_infinite]'></div>
        <div className='absolute top-0 -right-4 w-72 h-72 bg-purple-900 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-[blob_7s_infinite] [animation-delay:2s]'></div>
        <div className='absolute -bottom-8 left-20 w-72 h-72 bg-sky-900 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-[blob_7s_infinite] [animation-delay:4s]'></div>

        <Toaster
          position='top-center'
          reverseOrder={false}
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
            },
          }}
        />

        <div className='relative z-10 container mx-auto p-4 md:p-8 max-w-5xl'>
          <header className='text-center mb-12'>
            <div className='relative inline-block mb-4'>
              <FaBitcoin className='relative text-6xl md:text-7xl text-brand-orange' />
              <div className='absolute inset-0 bg-brand-orange blur-xl opacity-50'></div>
            </div>
            <h1 className='text-4xl md:text-5xl font-bold text-neutral-100 tracking-tight'>
              The Satoshi Standard
            </h1>
            <p className='text-neutral-400 mt-2 text-lg'>
              What do things *really* cost?
            </p>
          </header>
          <SavedItemsProvider
            btcPrices={btcPrices}
            supportedCurrencies={supportedCurrencies}
            fetchPriceForCurrency={fetchPriceForCurrency}
          >
            <main className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              <div className='lg:pr-4'>
                <Converter
                  btcPrices={btcPrices}
                  isLoading={isLoading}
                  supportedCurrencies={supportedCurrencies}
                  fetchPriceForCurrency={fetchPriceForCurrency}
                />
              </div>
              <div>
                <SavedItemsList onCompare={handleComparePrice} />
              </div>
            </main>
          </SavedItemsProvider>
        </div>
        {isModalOpen && (
          <HistoricalPriceModal
            isLoading={isModalLoading}
            data={modalData}
            onClose={closeModal}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
          />
        )}
      </div>
    </SkeletonTheme>
  );
}

export default App;
