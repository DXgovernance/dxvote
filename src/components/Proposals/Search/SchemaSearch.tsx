import { useProposals } from 'hooks/useProposals';
import { useState, useEffect, ChangeEvent , useMemo} from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useContext } from 'contexts';
import { ProposalsExtended } from 'contexts/proposals';

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
  const [state, dispatch] = useProposals();
  const [schemeFilter, setSchemeFilter] = useState('All Schemes');

  const history = useHistory();
  const location = useLocation();
  const params = useMemo(() =>  new URLSearchParams(location.search), [location.search])

  // load filter from url if any on initial load
  // load filter from url  when back on history
  // I dont understant what useHistory functions
  useEffect(() => {
    if (params.get('scheme')) setSchemeFilter(params.get('scheme'));
    history.listen(location => {
      const params = new URLSearchParams(location.search);
      if (history.action === 'POP') {
        if (params.get('scheme')) setSchemeFilter(params.get('scheme'));
        else setSchemeFilter('All Schemes');
      }
    });
  },[schemeFilter, history, params] );


  function onSchemeFilterChange(event: ChangeEvent<HTMLInputElement>) {
    params.delete('scheme');
    params.append('scheme', event.target.value);
    history.push({
      location: location.pathname,
      search: params.toString(),
    });
    setSchemeFilter(event.target.value);
  }

  useEffect(() => {
    let sortedProposals: ProposalsExtended[];
    dispatch({type: 'update', payload: {loading: true}})
    // set Loading to true

    if (schemeFilter !== 'All Schemes') {
      sortedProposals = state.proposals.filter(
        proposal => proposal.scheme === schemeFilter
      );
    }

    dispatch({ type: 'update', payload: {loading: false, error: null, proposals: sortedProposals} }); //triggers reindex
  }, [schemeFilter, state.proposals, dispatch]);


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
