import { useCallback, useMemo } from 'react';
import useLocalStorage from './useLocalStorage';

interface Expirable<T> {
  value: T;
  expiry: number;
}

const ONE_DAY = 1000 * 60 * 60 * 24;

function useLocalStorageWithExpiry<T>(
  key: string,
  defaultValue: T,
  ttlMs: number = ONE_DAY
) {
  const [expirable, setExpirable] = useLocalStorage<Expirable<T>>(key, {
    value: defaultValue,
    expiry: 0,
  });

  const setWithExpiry = useCallback(
    function (value: T) {
      setExpirable({
        value,
        expiry: new Date().getTime() + ttlMs,
      });
    },
    [setExpirable, ttlMs]
  );

  const value = useMemo(() => {
    const now = new Date();
    if (now.getTime() > expirable.expiry) {
      setWithExpiry(defaultValue);
      return defaultValue;
    }
    return expirable.value;
  }, [expirable, setWithExpiry, defaultValue]);

  return [value, setWithExpiry] as const;
}

export default useLocalStorageWithExpiry;
