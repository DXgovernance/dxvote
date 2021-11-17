import { useState, useCallback } from 'react';
import { useDebounceFn } from './useDebounceFn';
import useQuery from './useQuery';

function useQueryStringValue(
  key: string,
  initialValue: string
): [string, (value: string) => void] {
  const { query, setQueryParam } = useQuery();
  const [value, setValue] = useState<string>(query.get(key) || initialValue);
  const setQueryParamDebounced = useDebounceFn(setQueryParam, 500);

  const onSetValue = useCallback(
    (newValue: string) => {
      setValue(newValue);
      setQueryParamDebounced(key, newValue);
    },
    [key]
  );

  return [value, onSetValue];
}

export default useQueryStringValue;
