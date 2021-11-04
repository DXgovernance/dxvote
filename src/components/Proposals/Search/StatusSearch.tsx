import { useProposals } from 'hooks/useProposals';
import { useState, useEffect } from 'react';
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
  const { proposals, setProposals } = useProposals();
  const [isLoading, setIsLoading] = useState(false);
  const [stateFilter, setStateFilter] = useState('Any Status');

  const history = useHistory();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // load filter from url if any on initial load
  // load filter from url  when back on history
  // I dont understant what useHistory functions
  useEffect(() => {
    setIsLoading(true);
    if (params.get('state')) setStateFilter(params.get('state'));
    setIsLoading(false);
    history.listen(location => {
      const params = new URLSearchParams(location.search);
      if (history.action === 'POP') {
        setIsLoading(true);
        if (params.get('state')) setStateFilter(params.get('state'));
        else setStateFilter('Any Status');
        setIsLoading(false);
      }
    });
  }, []);

  /**
   * seperating searching
   */

  function onStateFilterChange(event) {
    params.delete('state');
    params.append('state', event.target.value);
    history.push({
      location: location.pathname,
      search: params.toString(),
    });
    setStateFilter(event.target.value);
  }

  useEffect(() => {
    let sortedProposals;
    setIsLoading(true);

    if (stateFilter != 'Any Status') {
      sortedProposals = proposals.filter(
        proposal =>
          parseInt(proposal.stateInVotingMachine) === parseInt(stateFilter)
      );
    }

    setProposals(sortedProposals); //triggers reindex
    setIsLoading(false);
  }, [stateFilter]);

  if(isLoading){
    return <div>Loading...</div>
  }

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
