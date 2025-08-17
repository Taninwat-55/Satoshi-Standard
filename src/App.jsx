import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import Converter from './components/Converter';
import SavedItemsList from './components/SavedItemsList';
import HistoricalPriceModal from './components/HistoricalPriceModal';
import {
  fetchBitcoinPriceHistoryRange,
  fetchBitcoinPrices,
} from './api/cryptoApi';
import { useLocalStorage } from './hooks/useLocalStorage';
import { FaBitcoin } from 'react-icons/fa';

function App() {
  const [btcPrices, setBtcPrices] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // All localStorage logic is now handled by our custom hook!
  const [savedItems, setSavedItems] = useLocalStorage('savedSatoshiItems', []);

  // State for the modal remains here as it's specific to this component's UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [historyCache, setHistoryCache] = useState({});

  // Effect to fetch prices on initial load
  useEffect(() => {
    async function loadPrices() {
      setIsLoading(true);
      const prices = await fetchBitcoinPrices();
      setBtcPrices(prices);
      setIsLoading(false);
    }
    loadPrices();
  }, []);

  // Functions to manage the saved items list
  const addItemToList = (item) => {
    setSavedItems((prevItems) => [
      ...prevItems,
      { ...item, id: Date.now(), dateAdded: new Date().toISOString() },
    ]);
  };

  const removeItemFromList = (itemId) => {
    setSavedItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemId)
    );
  };

  const clearList = () => {
    setSavedItems([]);
  };

  // Function to handle the price comparison logic
  const handleComparePrice = useCallback(
    async (item) => {
      setIsModalLoading(true);
      setIsModalOpen(true);
      setModalData(null);

      let priceHistory = historyCache[item.currency];

      if (!priceHistory) {
        console.log(
          `Fetching new history for ${item.currency.toUpperCase()}...`
        );
        priceHistory = await fetchBitcoinPriceHistoryRange(item.currency);

        // Save new data in cache
        if (priceHistory) {
          setHistoryCache((prevCache) => ({
            ...prevCache,
            [item.currency]: priceHistory,
          }));
        }
      } else {
        console.log(`Using cached history for ${item.currency.toUpperCase()}.`);
      }

      if (priceHistory && btcPrices) {
        const chartData = priceHistory.map(([timestamp, btcPrice]) => {
          const sats = (parseFloat(item.price) / btcPrice) * 100_000_000;
          return {
            date: new Date(timestamp).toLocaleDateString(),
            sats: Math.round(sats),
          };
        });

        const currentBtcPrice = btcPrices[item.currency.toLowerCase()];
        const currentSats =
          (parseFloat(item.price) / currentBtcPrice) * 100_000_000;
        chartData.push({
          date: new Date().toLocaleDateString(),
          sats: Math.round(currentSats),
        });

        setModalData({
          itemName: item.name,
          chartData: chartData,
        });
      } else {
        setModalData({
          error: 'Could not fetch historical data for this item.',
        });
      }
      setIsModalLoading(false);
    },
    [btcPrices, historyCache]
  );

  return (
    <div className='bg-slate-900 text-slate-200 min-h-screen font-sans'>
      <div className='container mx-auto p-4 md:p-8 max-w-4xl'>
        <header className='text-center mb-12'>
          <FaBitcoin className='inline-block text-5xl md:text-6xl mb-4 text-[#F7931A]' />
          <h1 className='text-4xl md:text-5xl font-bold text-white'>
            The Satoshi Standard
          </h1>
          <p className='text-slate-400 mt-2'>What do things *really* cost?</p>
        </header>
        <main className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <div className='md:pr-4'>
            <Converter
              btcPrices={btcPrices}
              isLoading={isLoading}
              addItemToList={addItemToList}
            />
          </div>
          <div>
            <SavedItemsList
              items={savedItems}
              removeItem={removeItemFromList}
              clearList={clearList}
              onCompare={handleComparePrice}
            />
          </div>
        </main>
      </div>
      {isModalOpen && (
        <HistoricalPriceModal
          isLoading={isModalLoading}
          data={modalData}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
