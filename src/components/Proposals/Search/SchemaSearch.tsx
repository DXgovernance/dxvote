import { useProposals } from 'hooks/useProposals';
import { useParams } from 'hooks/useSearch';
import { useState, useEffect} from 'react';
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
  const [state, dispatch] = useProposals();
  const [schemeFilter, setSchemeFilter] = useState('All Schemes');

  const {onFilterChange,  getParams} = useParams('scheme', 'All Schemes')


  useEffect(() => {
    setSchemeFilter(getParams)
    dispatch({
      type: 'filter',
      payload: {
        title: state.filters.title,
        status: state.filters.status,
        scheme: schemeFilter,
      },
    });
  }, [schemeFilter, getParams]);

  return (
    <ProposalsFilter
      name="schemeFilter"
      id="schemeSelector"
      value={schemeFilter}
      onChange={onFilterChange}
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
