import { useProposals } from 'hooks/useProposals';
import { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useContext } from 'contexts';

const ProposalsFilter = styled.select`
  background-color: ${props => props.color || '#536DFE'};
  border-radius: 4px;
  color: white;
  height: 34px;
  letter-spacing: 1px;
  font-weight: 500;
  line-height: 34px;
  text-align: center;
  cursor: pointer;
  width: 200px;
  padding: 0px 10px;
  margin: 10px 0px;
  font-family: var(--roboto);
  border: 0px;
  align-self: center;
`;

const SchemaSearch = () => {
  const {
    context: { daoStore },
  } = useContext();
  const schemes = daoStore.getAllSchemes();
  const { proposals, setProposals } = useProposals();
  const [isLoading, setIsLoading] = useState(false);
  const [schemeFilter, setSchemeFilter] = useState('All Schemes');

  const history = useHistory();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // load filter from url if any on initial load
  // load filter from url  when back on history
  // I dont understant what useHistory functions
  useEffect(() => {
    setIsLoading(true);
    if (params.get('scheme')) setSchemeFilter(params.get('scheme'));
    setIsLoading(false);
    history.listen(location => {
      const params = new URLSearchParams(location.search);
      if (history.action === 'POP') {
        setIsLoading(true);
        if (params.get('scheme')) setSchemeFilter(params.get('scheme'));
        else setSchemeFilter('All Schemes');
        setIsLoading(false);
      }
    });
  }, []);

  /**
   * seperating searching
   */

  function onSchemeFilterChange(event) {
    params.delete('scheme');
    params.append('scheme', event.target.value);
    history.push({
      location: location.pathname,
      search: params.toString(),
    });
    setSchemeFilter(event.target.value);
  }

  useEffect(() => {
    let sortedProposals;
    setIsLoading(true);

    if (schemeFilter !== 'All Schemes') {
      sortedProposals = proposals.filter(
        proposal => proposal.scheme === schemeFilter
      );
    }

    setProposals(sortedProposals); //triggers reindex
    setIsLoading(false);
  }, [schemeFilter]);

  if(isLoading){
    return <div>Loading...</div>
  }

  return (
    <ProposalsFilter
      name="schemeFilter"
      id="schemeSelector"
      value={schemeFilter}
      onChange={onSchemeFilterChange}
    >
      <option value="All Schemes">All Schemes</option>
      {schemes.map(scheme => {
        return (
          <option key={scheme.address} value={scheme.address}>
            {scheme.name}
          </option>
        );
      })}
    </ProposalsFilter>
  );
};

export default SchemaSearch;
