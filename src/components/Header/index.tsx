import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import Web3ConnectStatus from '../Web3ConnectStatus';
import { useContext } from '../../contexts';
import { FiSettings, FiUser, FiBarChart2 } from 'react-icons/fi';
import dxdaoIcon from 'assets/images/DXdao.svg';
import Web3 from 'web3';
import { bnum } from '../../utils';
import { Box } from '../../components/common';

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

const ItemBox = styled(Box)`
  color: var(--dark-text-gray);
  padding: 5px 10px;
  font-weight: 500;
  font-size: 16px;
  margin-right: 10px;
  height: 28px;
  border-radius: 6px;
`;

const WarningDev = styled.div`
  margin-left: 5px;
  padding-top: 3px;
  color: red;
`;

const Header = observer(() => {
  const NavItem = withRouter(({ route, history, children }) => {
    return (
      <div
        style={{ cursor: 'pointer' }}
        onClick={() => {
          history.push(route);
        }}
      >
        {' '}
        {children}{' '}
      </div>
    );
  });

  const {
    context: {
      userStore,
      providerStore,
      blockchainStore,
      configStore,
      daoStore,
    },
  } = useContext();

  const { active, account } = providerStore.getActiveWeb3React();

  const isTestingEnv = !window?.location?.href?.includes('dxvote.eth.link');

  if (!active) {
    return (
      <NavWrapper>
        <NavSection>
          <NavItem route={`/`}>
            <MenuItem>
              <img alt="dxdao" src={dxdaoIcon} />
              {isTestingEnv && <WarningDev>Testing Environment</WarningDev>}
            </MenuItem>
          </NavItem>
        </NavSection>
        <NavSection>
          <Web3ConnectStatus text="Connect Wallet" />
          <NavItem route={`/config`}>
            <a>
              <FiSettings style={{ margin: '0px 10px', color: '#616161' }} />
            </a>
          </NavItem>
        </NavSection>
      </NavWrapper>
    );
  } else {
    const networkName = configStore.getActiveChainName();
    const userInfo = userStore.getUserInfo();
    const votingMachines = blockchainStore.initialLoadComplete
      ? configStore.getNetworkContracts().votingMachines
      : {};

    const dxdBalance =
      active && userInfo.dxdBalance
        ? parseFloat(
            Number(Web3.utils.fromWei(userInfo.dxdBalance.toString())).toFixed(
              2
            )
          )
        : 0;
    const genBalance =
      active && userInfo.genBalance
        ? parseFloat(
            Number(Web3.utils.fromWei(userInfo.genBalance.toString())).toFixed(
              2
            )
          )
        : 0;
    const { userRep, totalSupply } =
      active && blockchainStore.initialLoadComplete
        ? daoStore.getRepAt(account, providerStore.getCurrentBlockNumber())
        : { userRep: bnum(0), totalSupply: bnum(0) };
    const repPercentage = active
      ? userRep.times(100).div(totalSupply).toFixed(4)
      : bnum(0);

    return (
      <NavWrapper>
        <NavSection>
          <NavItem route={`/${networkName}/proposals`}>
            <MenuItem>
              <img alt="dxdao" src={dxdaoIcon} />
              {isTestingEnv && <WarningDev>Testing Environment</WarningDev>}
            </MenuItem>
          </NavItem>
        </NavSection>
        {blockchainStore.initialLoadComplete ? (
          <NavSection>
            {account && (
              <>
                {votingMachines.dxd ? (
                  <ItemBox> {dxdBalance} DXD </ItemBox>
                ) : (
                  <div />
                )}
                {votingMachines.gen ? (
                  <ItemBox> {genBalance} GEN </ItemBox>
                ) : (
                  <div />
                )}
                <ItemBox> {repPercentage.toString()} % REP </ItemBox>
              </>
            )}
            <Web3ConnectStatus text="Connect Wallet" />
            <NavItem route={`/${networkName}/info`}>
              <a>
                <FiBarChart2 style={{ margin: '0px 10px', color: '#616161' }} />
              </a>
            </NavItem>
            <NavItem route={`/config`}>
              <a>
                <FiSettings style={{ margin: '0px 10px', color: '#616161' }} />
              </a>
            </NavItem>
            {account && (
              <NavItem route={`/${networkName}/user/${account}`}>
                <a>
                  <FiUser style={{ margin: '0px 10px', color: '#616161' }} />
                </a>
              </NavItem>
            )}
          </NavSection>
        ) : (
          <NavSection>
            <Web3ConnectStatus text="Connect Wallet" />
            <NavItem route={`/config`}>
              <a>
                <FiSettings style={{ margin: '0px 10px', color: '#616161' }} />
              </a>
            </NavItem>
          </NavSection>
        )}
      </NavWrapper>
    );
  }
});

export default Header;
