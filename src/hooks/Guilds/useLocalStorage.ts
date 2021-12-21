import { useState, useEffect } from 'react';

function getLocalStorageOrDefault<T>(key: string, defaultValue: T) {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;

  return JSON.parse(stored);
}

function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(
    getLocalStorageOrDefault<T>(key, defaultValue)
  );

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

export default useLocalStorage;