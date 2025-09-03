import React, { useState, useMemo } from 'react';
import { SavedItemsContext } from './SavedItemsContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { toast } from 'react-hot-toast';

export function SavedItemsProvider({ children, btcPrices }) {
  const [savedItems, setSavedItems] = useLocalStorage('savedSatoshiItems', []);
  const [editingId, setEditingId] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('dateAdded-desc');

  const addItemToList = (item) => {
    setSavedItems((prevItems) => [
      ...prevItems,
      { ...item, id: Date.now(), dateAdded: new Date().toISOString() },
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

  const updateItem = (updatedItem) => {
    if (!btcPrices) {
      toast.error('Could not update item, BTC prices unavailable.');
      return;
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
  };

  return (
    <SavedItemsContext.Provider value={value}>
      {children}
    </SavedItemsContext.Provider>
  );
}
