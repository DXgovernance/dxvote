import { useProposals } from 'hooks/useProposals';
import { useState, useEffect} from 'react';
import { enumKeys, VotingMachineProposalState } from 'utils';
import { useParams } from 'hooks/useSearch';
import { ProposalsFilter } from './style';


const StatusSearch = () => {
  const [{filters: {scheme, search}}, dispatch] = useProposals();
  const [stateFilter, setStateFilter] = useState('Any Status');
  const {onFilterChange,  getParams} = useParams('state', 'Any Status')


  useEffect(() => {
    setStateFilter(getParams)
    dispatch({
      type: 'filter',
      payload: {
        search: search,
        scheme: scheme,
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
