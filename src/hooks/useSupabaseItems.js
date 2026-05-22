import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

/**
 * Hook for managing saved items in Supabase.
 * When user is authenticated, syncs with database.
 * Returns null when not configured or not authenticated.
 */
export function useSupabaseItems() {
    const { user, isAuthenticated } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch items from Supabase
    const fetchItems = useCallback(async () => {
        if (!isSupabaseConfigured() || !isAuthenticated || !user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('saved_items')
                .select('*')
                .eq('user_id', user.id)
                .order('date_added', { ascending: false });

            if (error) throw error;

            // Transform snake_case to camelCase for frontend consistency
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

            setItems(transformedItems);
        } catch (error) {
            console.error('Error fetching items:', error);
            toast.error('Failed to load items');
        } finally {
            setLoading(false);
        }
    }, [user, isAuthenticated]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Add item to Supabase
    const addItem = useCallback(async (item) => {
        if (!isSupabaseConfigured() || !user) return null;

        try {
            const newItem = {
                user_id: user.id,
                name: item.name,
                price: item.price,
                currency: item.currency,
                sats: item.sats,
                category: item.category || null,
                current_sats: item.currentSats || null,
            };

            const { data, error } = await supabase
                .from('saved_items')
                .insert(newItem)
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

            setItems(prev => [transformedItem, ...prev]);
            return transformedItem;
        } catch (error) {
            console.error('Error adding item:', error);
            toast.error('Failed to save item');
            return null;
        }
    }, [user]);

    // Update item in Supabase
    const updateItem = useCallback(async (updatedItem) => {
        if (!isSupabaseConfigured() || !user) return null;

        try {
            const { data, error } = await supabase
                .from('saved_items')
                .update({
                    name: updatedItem.name,
                    price: updatedItem.price,
                    currency: updatedItem.currency,
                    sats: updatedItem.sats,
                    category: updatedItem.category || null,
                    current_sats: updatedItem.currentSats || null,
                })
                .eq('id', updatedItem.id)
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

            setItems(prev =>
                prev.map(item => (item.id === transformedItem.id ? transformedItem : item))
            );
            return transformedItem;
        } catch (error) {
            console.error('Error updating item:', error);
            toast.error('Failed to update item');
            return null;
        }
    }, [user]);

    // Remove item from Supabase
    const removeItem = useCallback(async (itemId) => {
        if (!isSupabaseConfigured() || !user) return false;

        try {
            const { error } = await supabase
                .from('saved_items')
                .delete()
                .eq('id', itemId)
                .eq('user_id', user.id);

            if (error) throw error;

            setItems(prev => prev.filter(item => item.id !== itemId));
            return true;
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Failed to remove item');
            return false;
        }
    }, [user]);

    // Clear all items
    const clearItems = useCallback(async () => {
        if (!isSupabaseConfigured() || !user) return false;

        try {
            const { error } = await supabase
                .from('saved_items')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;

            setItems([]);
            return true;
        } catch (error) {
            console.error('Error clearing items:', error);
            toast.error('Failed to clear items');
            return false;
        }
    }, [user]);

    // Import items (for migration from localStorage)
    const importItems = useCallback(async (newItems) => {
        if (!isSupabaseConfigured() || !user || !Array.isArray(newItems)) return false;

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

            const { data, error } = await supabase
                .from('saved_items')
                .insert(itemsToInsert)
                .select();

            if (error) throw error;

            await fetchItems(); // Refresh the list
            return true;
        } catch (error) {
            console.error('Error importing items:', error);
            toast.error('Failed to import items');
            return false;
        }
    }, [user, fetchItems]);

    return {
        items,
        loading,
        addItem,
        updateItem,
        removeItem,
        clearItems,
        importItems,
        refresh: fetchItems,
    };
}
