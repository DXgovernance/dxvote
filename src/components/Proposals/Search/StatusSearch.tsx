import { useProposals } from 'hooks/useProposals';
import { useState, useEffect} from 'react';
import { enumKeys, VotingMachineProposalState } from 'utils';
import styled from 'styled-components';
import { useParams } from 'hooks/useSearch';

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

const StatusSearch = () => {
  const [state, dispatch] = useProposals();
  const [stateFilter, setStateFilter] = useState('Any Status');

  const {onFilterChange,  getParams} = useParams('state', 'Any Status')


  useEffect(() => {
    setStateFilter(getParams)
    dispatch({
      type: 'filter',
      payload: {
        search: state.filters.search,
        scheme: state.filters.scheme,
        status: stateFilter,
      },
    });
  }, [stateFilter, getParams]);

  return (
    <ProposalsFilter
      name="stateFilter"
      id="stateSelector"
      value={stateFilter}
      onChange={onFilterChange}
    >
      <option value="Any Status">Any Status</option>
      {enumKeys(VotingMachineProposalState).map(
        i =>
          i !== 'None' && (
            <option value={VotingMachineProposalState[i]}>{i}</option>
          )
      )}
    </ProposalsFilter>
  );
};

export default StatusSearch;
