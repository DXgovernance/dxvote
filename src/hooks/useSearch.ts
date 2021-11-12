import { useState, useEffect , useMemo, ChangeEvent} from 'react';
import { useHistory, useLocation } from 'react-router-dom';


export const useParams = (searchType: string, defaultSearchtype: string)  => {
  const history = useHistory();
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const [getParams, setParams] = useState('')


  // load filter from url if any on initial load
  // load filter from url  when back on history
  useEffect(() => {
    if (params.get(searchType)) setParams(params.get(searchType));
    history.listen(location => {
      const params = new URLSearchParams(location.search);
      if (history.action === 'POP') {
        if (params.get(searchType)) setParams(params.get(searchType));
        // setdefault
        else setParams(defaultSearchtype);
      }
    });
  }, [history, params, searchType, defaultSearchtype]);

  function onFilterChange(event: ChangeEvent<HTMLInputElement>, title: string) {
    params.delete(title);
    params.append(title, event.target.value);
    history.push({
      location: location.pathname,
      search: params.toString(),
    });
    setParams(event.target.value)
  }

  return {
    onFilterChange,
    setParams,
    getParams
  };
};
