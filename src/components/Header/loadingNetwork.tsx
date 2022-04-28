import { observer } from 'mobx-react';
import styled from 'styled-components';
import dxdaoIcon from 'assets/images/DXdao.svg';

const NavWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 20px 0px 0px 0px;
`;

const NavSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  color: var(--nav-text-light);
  font-size: 16px;
  line-height: 19px;
  cursor: pointer;
`;

const WarningDev = styled.div`
  margin-left: 5px;
  padding-top: 3px;
  color: red;
`;

const LoadingNetworkHeader = observer(() => {
  const isTestingEnv = !window?.location?.href?.includes('dxvote.eth');

  return (
    <NavWrapper>
      <NavSection>
        <>
          <MenuItem>
            <img alt="dxdao" src={dxdaoIcon} />
            {isTestingEnv && <WarningDev>Testing Environment</WarningDev>}
          </MenuItem>
        </>
      </NavSection>
    </NavWrapper>
  );
});

export default LoadingNetworkHeader;
