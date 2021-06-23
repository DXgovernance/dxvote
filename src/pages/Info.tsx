import React from 'react';
import styled from 'styled-components'; 
import { useLocation } from 'react-router-dom';
import ActiveButton from '../components/common/ActiveButton';
import Box from '../components/common/Box';

import FinanceInformation from '../components/FinanceInformation';
import SchemesInformation from '../components/SchemesInformation';
import GovernanceInformation from '../components/GovernanceInformation';
import ProposalsTable from '../components/ProposalsTable';

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
    const searchPath = useLocation().search;
    return (
      <InfoPageWrapper>
        <InfoNavigation>
          <ActiveButton route="/info?view=governance">Governance</ActiveButton>
          <ActiveButton route="/info?view=finance">Finance</ActiveButton>
          <ActiveButton route="/info?view=schemes">Schemes</ActiveButton>
        </InfoNavigation>
        <div>
          { searchPath === "?view=schemes" ?
            <SchemesInformation/>
          : searchPath === "?view=governance" ?
            <GovernanceInformation/>
          : <FinanceInformation/>
          }
        </div>
      </InfoPageWrapper>
    );
};

export default InfoPage;
