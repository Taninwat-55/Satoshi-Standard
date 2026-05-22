import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SavedItemsContext } from './SavedItemsContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export function SavedItemsProvider({
  children,
  btcPrices,
  supportedCurrencies,
  fetchPriceForCurrency,
  priceSource,
  setPriceSource,
}) {
  // Local storage for guest mode
  const [localItems, setLocalItems] = useLocalStorage('savedSatoshiItems', []);
  const [satoshiGoal, setSatoshiGoal] = useLocalStorage('satoshiGoal', 1000000);
  const [satsMode, setSatsMode] = useLocalStorage('satsMode', false);

  // Remote items for authenticated users
  const [remoteItems, setRemoteItems] = useState([]);
  const [remoteLoading, setRemoteLoading] = useState(false);

  // UI state
  const [editingId, setEditingId] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('dateAdded-desc');

  const { user, isAuthenticated, profile, updateProfile } = useAuth();

  // Determine which items array to use
  const savedItems = isAuthenticated && isSupabaseConfigured() ? remoteItems : localItems;
  const setSavedItems = isAuthenticated && isSupabaseConfigured()
    ? setRemoteItems
    : setLocalItems;

  // Fetch items from Supabase when authenticated
  const fetchRemoteItems = useCallback(async () => {
    if (!isSupabaseConfigured() || !user) return;

    setRemoteLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', user.id)
        .order('date_added', { ascending: false });

      if (error) throw error;

      const transformedItems = data.map(item => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        currency: item.currency,
        sats: parseInt(item.sats),
        category: item.category,
        dateAdded: item.date_added,
        currentSats: item.current_sats ? parseInt(item.current_sats) : null,
      }));

      setRemoteItems(transformedItems);
    } catch (error) {
      console.error('Error fetching remote items:', error);
    } finally {
      setRemoteLoading(false);
    }
  }, [user]);

  // Migrate localStorage items to Supabase on first login
  const migrateLocalItems = useCallback(async () => {
    if (!isSupabaseConfigured() || !user || localItems.length === 0) return;

    try {
      const itemsToInsert = localItems.map(item => ({
        user_id: user.id,
        name: item.name,
        price: item.price,
        currency: item.currency,
        sats: item.sats,
        category: item.category || null,
        date_added: item.dateAdded || new Date().toISOString(),
        current_sats: item.currentSats || null,
      }));

      const { error } = await supabase
        .from('saved_items')
        .insert(itemsToInsert);

      if (error) throw error;

      // Clear local items after successful migration
      setLocalItems([]);
      toast.success(`Migrated ${localItems.length} items to your account!`);
      await fetchRemoteItems();
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Failed to migrate local items');
    }
  }, [user, localItems, setLocalItems, fetchRemoteItems]);

  // Load remote items when user authenticates
  useEffect(() => {
    if (isAuthenticated && isSupabaseConfigured()) {
      fetchRemoteItems();
    }
  }, [isAuthenticated, fetchRemoteItems]);

  // Offer to migrate local items when user logs in
  useEffect(() => {
    if (isAuthenticated && localItems.length > 0 && remoteItems.length === 0 && !remoteLoading) {
      // Delay to ensure remote items have been fetched first
      const timer = setTimeout(() => {
        if (localItems.length > 0) {
          toast((t) => (
            <div className="flex flex-col gap-2">
              <span>You have {localItems.length} items saved locally. Want to sync them to your account?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    migrateLocalItems();
                    toast.dismiss(t.id);
                  }}
                  className="px-3 py-1 bg-brand-orange text-white text-sm rounded"
                >
                  Yes, sync
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="px-3 py-1 bg-neutral-700 text-white text-sm rounded"
                >
                  Not now
                </button>
              </div>
            </div>
          ), { duration: 10000 });
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, localItems.length, remoteItems.length, remoteLoading, migrateLocalItems]);

  // Sync profile preferences from Supabase
  useEffect(() => {
    if (profile) {
      if (profile.satoshi_goal) setSatoshiGoal(profile.satoshi_goal);
      if (profile.sats_mode !== undefined) setSatsMode(profile.sats_mode);
    }
  }, [profile, setSatoshiGoal, setSatsMode]);

  const addItemToList = async (item) => {
    const newItem = {
      ...item,
      id: Date.now(),
      dateAdded: new Date().toISOString(),
      currentSats: item.currentSats || 0,
    };

    if (isAuthenticated && isSupabaseConfigured() && user) {
      try {
        const { data, error } = await supabase
          .from('saved_items')
          .insert({
            user_id: user.id,
            name: item.name,
            price: item.price,
            currency: item.currency,
            sats: item.sats,
            category: item.category || null,
            current_sats: item.currentSats || null,
          })
          .select()
          .single();

        if (error) throw error;

        const transformedItem = {
          id: data.id,
          name: data.name,
          price: parseFloat(data.price),
          currency: data.currency,
          sats: parseInt(data.sats),
          category: data.category,
          dateAdded: data.date_added,
          currentSats: data.current_sats ? parseInt(data.current_sats) : null,
        };

        setRemoteItems(prev => [transformedItem, ...prev]);
        toast.success(`"${item.name}" added to the list!`);
      } catch (error) {
        console.error('Error adding item:', error);
        toast.error('Failed to save item');
      }
    } else {
      setLocalItems(prev => [...prev, newItem]);
      toast.success(`"${item.name}" added to the list!`);
    }
  };

  const removeItemFromList = async (itemId) => {
    const itemToRemove = savedItems.find((item) => item.id === itemId);

    if (isAuthenticated && isSupabaseConfigured() && user) {
      try {
        const { error } = await supabase
          .from('saved_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', user.id);

        if (error) throw error;
        setRemoteItems(prev => prev.filter(item => item.id !== itemId));
      } catch (error) {
        console.error('Error removing item:', error);
        toast.error('Failed to remove item');
        return;
      }
    } else {
      setLocalItems(prev => prev.filter(item => item.id !== itemId));
    }

    if (itemToRemove) {
      toast.error(`"${itemToRemove.name}" removed.`);
    }
  };

  const clearList = async () => {
    if (savedItems.length === 0) return;

    if (isAuthenticated && isSupabaseConfigured() && user) {
      try {
        const { error } = await supabase
          .from('saved_items')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
        setRemoteItems([]);
      } catch (error) {
        console.error('Error clearing items:', error);
        toast.error('Failed to clear list');
        return;
      }
    } else {
      setLocalItems([]);
    }
    toast.success('List cleared!');
  };

  const updateItem = async (updatedItem) => {
    if (!btcPrices || !btcPrices[updatedItem.currency]) {
      if (fetchPriceForCurrency) {
        toast.error(`Price for ${updatedItem.currency} not available yet.`);
        return;
      } else {
        toast.error('Could not update item, BTC prices unavailable.');
        return;
      }
    }

    const btcPriceInSelectedCurrency = btcPrices[updatedItem.currency];
    const priceInBtc = parseFloat(updatedItem.price) / btcPriceInSelectedCurrency;
    const priceInSats = priceInBtc * 100_000_000;
    const finalUpdatedItem = {
      ...updatedItem,
      sats: Math.round(priceInSats),
    };

    if (isAuthenticated && isSupabaseConfigured() && user) {
      try {
        const { data, error } = await supabase
          .from('saved_items')
          .update({
            name: finalUpdatedItem.name,
            price: finalUpdatedItem.price,
            currency: finalUpdatedItem.currency,
            sats: finalUpdatedItem.sats,
            category: finalUpdatedItem.category || null,
            current_sats: finalUpdatedItem.currentSats || null,
          })
          .eq('id', finalUpdatedItem.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;

        const transformedItem = {
          id: data.id,
          name: data.name,
          price: parseFloat(data.price),
          currency: data.currency,
          sats: parseInt(data.sats),
          category: data.category,
          dateAdded: data.date_added,
          currentSats: data.current_sats ? parseInt(data.current_sats) : null,
        };

        setRemoteItems(prev =>
          prev.map(item => item.id === transformedItem.id ? transformedItem : item)
        );
      } catch (error) {
        console.error('Error updating item:', error);
        toast.error('Failed to update item');
        return;
      }
    } else {
      setLocalItems(prev =>
        prev.map(item => item.id === finalUpdatedItem.id ? finalUpdatedItem : item)
      );
    }

    toast.success(`"${finalUpdatedItem.name}" updated!`);
    setEditingId(null);
  };

  const importItems = async (newItems) => {
    if (!Array.isArray(newItems)) {
      toast.error('Invalid file format. Expected a list of items.');
      return;
    }

    if (isAuthenticated && isSupabaseConfigured() && user) {
      try {
        const itemsToInsert = newItems.map(item => ({
          user_id: user.id,
          name: item.name,
          price: item.price,
          currency: item.currency,
          sats: item.sats,
          category: item.category || null,
          date_added: item.dateAdded || new Date().toISOString(),
          current_sats: item.currentSats || null,
        }));

        const { error } = await supabase
          .from('saved_items')
          .insert(itemsToInsert);

        if (error) throw error;
        await fetchRemoteItems();
      } catch (error) {
        console.error('Error importing items:', error);
        toast.error('Failed to import items');
        return;
      }
    } else {
      setLocalItems(newItems);
    }
    toast.success('Portfolio imported successfully!');
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
        comparison = new Date(a.dateAdded) - new Date(b.dateAdded);
      }
      return direction === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [savedItems, sortCriteria]);

  const itemCategories = useMemo(() => {
    return [...new Set(savedItems.map((item) => item.category).filter(Boolean))];
  }, [savedItems]);

  // Persist satoshiGoal to Supabase for authenticated users
  const handleSetSatoshiGoal = useCallback(async (newGoal) => {
    setSatoshiGoal(newGoal);
    if (isAuthenticated && updateProfile) {
      try {
        await updateProfile({ satoshi_goal: newGoal });
      } catch (error) {
        console.error('Failed to sync goal:', error);
      }
    }
  }, [setSatoshiGoal, isAuthenticated, updateProfile]);

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
    setSatoshiGoal: handleSetSatoshiGoal,
    supportedCurrencies,
    fetchPriceForCurrency,
    btcPrices,
    itemCategories,
    priceSource,
    setPriceSource,
    satsMode,
    setSatsMode,
    importItems,
    isLoading: remoteLoading,
  };

  return (
    <SavedItemsContext.Provider value={value}>
      {children}
    </SavedItemsContext.Provider>
  );
}
