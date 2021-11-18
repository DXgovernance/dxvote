import { useMemo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

function useQuery() {
  const { search } = useLocation();
  const history = useHistory();

  const query = useMemo(() => new URLSearchParams(search), [search]);

  const setQueryParam = (key: string, value: string) => {
    const query = new URLSearchParams(window.location.search);
    query.delete(key);
    query.append(key, value);
    history.replace({ search: query.toString() });
  };

  return { query, setQueryParam };
}

export default useQuery;
