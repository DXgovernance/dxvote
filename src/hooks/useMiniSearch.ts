import MiniSearch, { Options, Query, SearchOptions } from 'minisearch';
import { useRef, useState } from 'react';

interface SearchItem {
  id: string;
}

export default function useMiniSearch<T extends SearchItem>(config: Options) {
  const [searchItems, setSearchItems] = useState<T[]>([]);
  const miniSearchRef = useRef<MiniSearch<T>>(new MiniSearch<T>(config));

  const buildIndex = (documents: T[]) => {
    setSearchItems(documents);
    miniSearchRef.current.removeAll();
    miniSearchRef.current.addAll(documents);
  };

  const query = (query: Query, searchOptions?: SearchOptions) => {
    const hits = miniSearchRef.current.search(query, searchOptions);
    return hits.map(hit => searchItems.find(item => item.id == hit.id));
  };

  return {
    instance: miniSearchRef.current,
    buildIndex,
    query,
  };
}
