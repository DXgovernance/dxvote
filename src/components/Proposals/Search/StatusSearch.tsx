import { enumKeys, VotingMachineProposalState } from 'utils';
import { ProposalsFilter } from './style';


const StatusSearch = ({ value, onFilter }) => {
  return (
    <ProposalsFilter
      name="stateFilter"
      id="stateSelector"
      value={value}
      onChange={(e) => onFilter(e.target.value)}
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
