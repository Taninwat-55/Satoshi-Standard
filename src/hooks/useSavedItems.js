import { useContext } from 'react';
import { SavedItemsContext } from '../contexts/SavedItemsContext.js';

export function useSavedItems() {
  const context = useContext(SavedItemsContext);
  if (context === undefined) {
    throw new Error('useSavedItems must be used within a SavedItemsProvider');
  }
  return context;
}
