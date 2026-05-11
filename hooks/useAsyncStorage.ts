import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

/**
 * Hook for managing AsyncStorage on mobile
 * Provides simple get/set/remove operations with loading states
 */
export function useAsyncStorage<T>(key: string) {
  const [value, setValue] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load value on mount
  useEffect(() => {
    const loadValue = async () => {
      try {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          setValue(JSON.parse(stored));
        }
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key]);

  const setStoredValue = async (newValue: T) => {
    try {
      setLoading(true);
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
      setValue(newValue);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const removeValue = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem(key);
      setValue(null);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    value,
    loading,
    error,
    setValue: setStoredValue,
    removeValue
  };
}
