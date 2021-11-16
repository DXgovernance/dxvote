import { useProposals } from 'hooks/useProposals';
import MiniSearch from 'minisearch';
import React, { useEffect, useState} from 'react';
import styled from 'styled-components';
import { useParams } from 'hooks/useParams';

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
    const [{ filters: { scheme, status }, proposals }, dispatch] = useProposals();
  const [titleFilter, setTitleFilter] = useState('');
  const {onFilterChange,  getParams} = useParams('title', '')
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

  useEffect(() => {
    setTitleFilter(getParams)
    // remove all indexed search
    miniSearch.removeAll();

    // add all proposals to search
    miniSearch.addAll(proposals);

    const search = miniSearch.search(titleFilter);
    dispatch({
      type: 'filter',
      payload: {
        status: status,
        search: search,
        scheme: scheme,
      },
    });
  }, [titleFilter, getParams]);

  return (
    <ProposalsNameFilter
      type="text"
      placeholder="Search by proposal title"
      name="titleFilter"
      id="titleFilter"
      value={titleFilter}
      onChange={onFilterChange}
    ></ProposalsNameFilter>
  );
};

export default TitleSearch;
