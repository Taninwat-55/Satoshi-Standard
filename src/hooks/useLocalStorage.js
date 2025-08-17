import { useState, useEffect } from 'react';

// Helper function to get initial value from localStorage
function getSavedValue(key, initialValue) {
  try {
    const savedValue = JSON.parse(localStorage.getItem(key));
    if (savedValue) {
      return savedValue;
    }
  } catch (error) {
    console.error(`Error parsing localStorage key “${key}”:`, error);
  }

  if (initialValue instanceof Function) {
    return initialValue();
  }
  return initialValue;
}

// The custom hook
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    return getSavedValue(key, initialValue);
  });

  // Effect to update localStorage when the state value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, value]);

  return [value, setValue];
}
