import styled from 'styled-components'; 
import { useLocation } from 'react-router-dom';
import { useContext } from '../contexts';
import ActiveButton from '../components/common/ActiveButton';
import Box from '../components/common/Box';

import FinanceInformation from '../components/FinanceInformation';
import SchemesInformation from '../components/SchemesInformation';
import GovernanceInformation from '../components/GovernanceInformation';

const InfoPageWrapper = styled(Box)`
  width: 100%;
`;

const InfoNavigation = styled.div`
  padding: 0px 10px 10px 10px;
  color: var(--dark-text-gray);
  border-bottom: 1px solid var(--line-gray);
  font-weight: 500;
  font-size: 18px;
  letter-spacing: 1px;
  display: flex;
  justify-content: space-around;
  flex-direction: row;
`;
const InfoPage = () => {
  const {
    context: { configStore },
  } = useContext();
  const networkName = configStore.getActiveChainName();
  const searchPath = useLocation().search;
  return (
    <InfoPageWrapper>
      <InfoNavigation>
        <ActiveButton route={`/${networkName}/info?view=governance`}>Governance</ActiveButton>
        <ActiveButton route={`/${networkName}/info?view=finance`}>Finance</ActiveButton>
        <ActiveButton route={`/${networkName}/info?view=schemes`}>Schemes</ActiveButton>
      </InfoNavigation>
      <div>
        { searchPath === `/${networkName}/info?view=schemes` ?
          <SchemesInformation/>
        : searchPath === `/${networkName}/info?view=governance` ?
          <GovernanceInformation/>
        : <FinanceInformation/>
        }
      </div>
    </InfoPageWrapper>
  );
};

export default InfoPage;
