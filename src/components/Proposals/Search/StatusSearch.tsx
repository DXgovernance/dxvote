import { enumKeys, VotingMachineProposalState } from 'utils';
import { ProposalsFilter } from './style';


const StatusSearch = ({ value, onFilter }) => {
  // const [{filters: {scheme, search}}, dispatch] = useProposals();
  // const [stateFilter, setStateFilter] = useState('Any Status');
  // const {onFilterChange,  getParams} = useParams('state', 'Any Status')


  // useEffect(() => {
  //   setStateFilter(getParams)
  //   dispatch({
  //     type: 'filter',
  //     payload: {
  //       search: search,
  //       scheme: scheme,
  //       status: stateFilter,
  //     },
  //   });
  // }, [stateFilter, getParams]);

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
