import { useProposals } from 'hooks/useProposals';
import MiniSearch from 'minisearch';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const ProposalsNameFilter = styled.input`
  background-color: white;
  border: 1px solid #536dfe;
  border-radius: 4px;
  color: #536dfe;
  height: 34px;
  letter-spacing: 1px;
  font-weight: 500;
  line-height: 32px;
  text-align: left;
  cursor: initial;
  width: 180px;
  padding: 0px 10px;
  margin: 5px 0px;
  font-family: var(--roboto);
  align-self: center;
`;

const TitleSearch = () => {
  const { proposals, setProposals } = useProposals();
  const [titleFilter, setTitleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  function onTitleFilterChange(event) {
    params.delete('title');
    params.append('title', event.target.value);
    history.push({
      location: location.pathname,
      search: params.toString(),
    });
    setTitleFilter(event.target.value);
  }
  const miniSearchRef = React.useRef(
    new MiniSearch({
      fields: ['title'],
      storeFields: ['id'],
      searchOptions: {
        fuzzy: 0.3,
        prefix: true,
        combineWith: 'AND',
      },
    })
  );
  const miniSearch = miniSearchRef.current;
  // load filter from url if any on initial load
  // load filter from url  when back on history
  useEffect(() => {
    setIsLoading(true);
    if (params.get('title')) setTitleFilter(params.get('title'));

    setIsLoading(false);
    history.listen(location => {
      const params = new URLSearchParams(location.search);
      if (history.action === 'POP') {
        setIsLoading(true);
        if (params.get('title')) setTitleFilter(params.get('title'));
        else setTitleFilter('');
        setIsLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    let sortedProposals;
    setIsLoading(true);

    miniSearch.removeAll();
    miniSearch.addAll(sortedProposals);

    if (titleFilter) {
      let search = miniSearch.search(titleFilter);
      sortedProposals = proposals.filter(proposal =>
        search.find(elem => elem.id === proposal.id)
      );
    }

    setProposals(sortedProposals); //triggers reindex
    setIsLoading(false);
  }, [titleFilter]);

  if(isLoading){
    return <div>Loading...</div>
  }

  return (
    <ProposalsNameFilter
      type="text"
      placeholder="Search by proposal title"
      name="titleFilter"
      id="titleFilter"
      value={titleFilter}
      onChange={onTitleFilterChange}
    ></ProposalsNameFilter>
  );
};

export default TitleSearch;
