import React, { useState, useMemo } from 'react';
import { SavedItemsContext } from './SavedItemsContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { toast } from 'react-hot-toast';

export function SavedItemsProvider({
  children,
  btcPrices,
  supportedCurrencies,
  fetchPriceForCurrency,
  priceSource,
  setPriceSource,
}) {
  const [savedItems, setSavedItems] = useLocalStorage('savedSatoshiItems', []);
  const [satoshiGoal, setSatoshiGoal] = useLocalStorage('satoshiGoal', 1000000);
  const [editingId, setEditingId] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('dateAdded-desc');
  const [satsMode, setSatsMode] = useLocalStorage('satsMode', false);

  const addItemToList = (item) => {
    setSavedItems((prevItems) => [
      ...prevItems,
      { ...item, id: Date.now(), dateAdded: new Date().toISOString(), currentSats: item.currentSats || 0 },
    ]);
    toast.success(`"${item.name}" added to the list!`);
  };

  const removeItemFromList = (itemId) => {
    const itemToRemove = savedItems.find((item) => item.id === itemId);
    setSavedItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemId)
    );
    if (itemToRemove) {
      toast.error(`"${itemToRemove.name}" removed.`);
    }
  };

  const clearList = () => {
    if (savedItems.length > 0) {
      setSavedItems([]);
      toast.success('List cleared!');
    }
  };

  const updateItem = async (updatedItem) => {
    // If currency changed or prices missing, try to fetch
    if (!btcPrices || !btcPrices[updatedItem.currency]) {
      if (fetchPriceForCurrency) {
        // Optimistically try to fetch, but we can't await state update easily here without side effects or race conditions
        // Actually, fetchPriceForCurrency returns nothing but updates logic in App.
        // But we need the price NOW.
        // Ideally fetchPriceForCurrency should return the fetched price?
        // In App.jsx I made it update state. It doesn't return the price.
        // I should probably rely on btcPrices being updated? But we can't wait for React render here.
        // For now, if price is missing, we error.
        // User should have selected currency in Edit form which triggers fetch.
        toast.error(`Price for ${updatedItem.currency} not available yet.`);
        return;
      } else {
        toast.error('Could not update item, BTC prices unavailable.');
        return;
      }
    }

    const btcPriceInSelectedCurrency = btcPrices[updatedItem.currency];
    const priceInBtc =
      parseFloat(updatedItem.price) / btcPriceInSelectedCurrency;
    const priceInSats = priceInBtc * 100_000_000;
    const finalUpdatedItem = {
      ...updatedItem,
      sats: Math.round(priceInSats),
    };
    setSavedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === finalUpdatedItem.id ? finalUpdatedItem : item
      )
    );
    toast.success(`"${finalUpdatedItem.name}" updated!`);
    setEditingId(null);
  };

  const sortedItems = useMemo(() => {
    const sorted = [...savedItems];
    const [criteria, direction] = sortCriteria.split('-');
    sorted.sort((a, b) => {
      let comparison = 0;
      if (criteria === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (criteria === 'sats') {
        comparison = a.sats - b.sats;
      } else {
        comparison = a.id - b.id;
      }
      return direction === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [savedItems, sortCriteria]);

  const itemCategories = useMemo(() => {
    return [...new Set(savedItems.map((item) => item.category).filter(Boolean))];
  }, [savedItems]);

  const value = {
    items: sortedItems,
    addItemToList,
    removeItemFromList,
    clearList,
    onUpdateItem: updateItem,
    editingId,
    setEditingId,
    sortCriteria,
    setSortCriteria,
    satoshiGoal,
    setSatoshiGoal,
    supportedCurrencies,
    fetchPriceForCurrency,
    btcPrices,
    itemCategories,
    priceSource,
    setPriceSource,
    satsMode,
    setSatsMode,
    importItems,
  };

  function importItems(newItems) {
    if (!Array.isArray(newItems)) {
      toast.error('Invalid file format. Expected a list of items.');
      return;
    }
    // Basic validation: check if items have necessary properties (optional but good)
    // For now, we trust the array but ensure IDs are unique if we were merging.
    // Since we are replacing, we just set it.

    setSavedItems(newItems);
    toast.success('Portfolio imported successfully!');
  }

  return (
    <SavedItemsContext.Provider value={value}>
      {children}
    </SavedItemsContext.Provider>
  );
}
