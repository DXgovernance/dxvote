import { useState, useEffect } from 'react';

function getSessionStorageOrDefault<T>(key: string, defaultValue: T) {
  const stored = sessionStorage.getItem(key);
  if (!stored) return defaultValue;

  return JSON.parse(stored);
}

function useSessionStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(
    getSessionStorageOrDefault<T>(key, defaultValue)
  );

  useEffect(() => {
    console.log("useSessionStorage", key, value);
    sessionStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

export default useSessionStorage;