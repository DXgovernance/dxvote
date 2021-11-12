import { useProposals } from 'hooks/useProposals';
import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { enumKeys, VotingMachineProposalState } from 'utils';
import styled from 'styled-components';

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

  const history = useHistory();
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  // load filter from url if any on initial load
  // load filter from url  when back on history
  // I dont understant what useHistory functions
  useEffect(() => {
    if (params.get('state')) setStateFilter(params.get('state'));
    history.listen(location => {
      const params = new URLSearchParams(location.search);
      if (history.action === 'POP') {
        if (params.get('state')) setStateFilter(params.get('state'));
        else setStateFilter('Any Status');
      }
    });
  }, []);

  function onStateFilterChange(event: ChangeEvent<HTMLInputElement>) {
    params.delete('state');
    params.append('state', event.target.value);
    history.push({
      location: location.pathname,
      search: params.toString(),
    });
    setStateFilter(event.target.value);
  }

  useEffect(() => {
      dispatch({
        type: 'filter',
        payload: { title:state.filters.title, scheme: state.filters.scheme, status: stateFilter },
      });
  }, [stateFilter]);

  return (
    <ProposalsFilter
      name="stateFilter"
      id="stateSelector"
      value={stateFilter}
      onChange={onStateFilterChange}
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
