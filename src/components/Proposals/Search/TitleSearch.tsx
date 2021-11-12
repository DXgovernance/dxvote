import { ProposalsExtended } from 'contexts/proposals';
import { useProposals } from 'hooks/useProposals';
import MiniSearch from 'minisearch';
import React, { useEffect, useState, useMemo, ChangeEvent } from 'react';
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
  const [state, dispatch] = useProposals();
  const [titleFilter, setTitleFilter] = useState('');
  const history = useHistory();
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  function onTitleFilterChange(event: ChangeEvent<HTMLInputElement>) {
    params.delete('title');
    params.append('title', event.target.value);
    history.push({
      location: location.pathname,
      search: params.toString(),
    });
    setTitleFilter(event.target.value);
  }
  const miniSearchRef = React.useRef(
    // create search engine and set title and id as searchable fields
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
    if (params.get('title')) setTitleFilter(params.get('title'));
    history.listen(location => {
      const params = new URLSearchParams(location.search);
      if (history.action === 'POP') {
        if (params.get('title')) setTitleFilter(params.get('title'));
        else setTitleFilter('');
      }
    });
  }, []);

  useEffect(() => {
    // remove all indexed search
    miniSearch.removeAll();

    // add all proposals to search
    miniSearch.addAll(state.proposals);
    dispatch({
      type: 'filter',
      payload: { status: state.filters.status, title: titleFilter, scheme: state.filters.scheme},
    });
  }, [titleFilter]);

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
