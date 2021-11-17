import { useContext } from 'contexts';
import { ProposalsFilter } from './style';

const SchemeSearch = ({ value, onFilter }) => {
  const {
    context: { daoStore },
  } = useContext();
  const schemes = daoStore.getAllSchemes();
  // const [
  //   {
  //     filters: { status, search },
  //   },
  //   dispatch,
  // ] = useProposals();
  // const [schemeFilter, setSchemeFilter] = useState('All Schemes');

  // const { onFilterChange, getParams } = useParams('scheme', 'All Schemes');

  // useEffect(() => {
  //   setSchemeFilter(getParams);
  //   dispatch({
  //     type: 'filter',
  //     payload: {
  //       search: search,
  //       status: status,
  //       scheme: schemeFilter,
  //     },
  //   });
  // }, [schemeFilter, getParams]);

  return (
    <ProposalsFilter
      name="schemeFilter"
      id="schemeSelector"
      value={value}
      onChange={(e) => onFilter(e.target.value)}
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

export default SchemeSearch;
