import { RouteComponentProps, withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import Web3ConnectStatus from '../Web3ConnectStatus';
import { useContext } from '../../contexts';
import { FiSettings, FiUser, FiBarChart2 } from 'react-icons/fi';
import dxdaoIcon from 'assets/images/DXdao.svg';
import { bnum, formatCurrency, normalizeBalance } from '../../utils';
import { Box } from '../../components/common';
import { useBalances } from 'hooks/useERC20';
import _ from 'lodash';

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

interface NavItemProps {
  route: string;
  children: React.ReactNode;
}

const Header = observer(() => {
  const NavItem = withRouter(
    ({ route, history, children }: NavItemProps & RouteComponentProps) => {
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
    }
  );

  const {
    context: { providerStore, blockchainStore, configStore, daoStore },
  } = useContext();

  const { active, account } = providerStore.getActiveWeb3React();

  const isTestingEnv = !window?.location?.href?.includes('dxvote.eth');

  const votingMachines = configStore.getNetworkContracts().votingMachines;

  const networkName = configStore.getActiveChainName();

  const { userRep, totalSupply } =
    active && blockchainStore.initialLoadComplete
      ? daoStore.getRepAt(account, providerStore.getCurrentBlockNumber())
      : { userRep: bnum(0), totalSupply: bnum(0) };
  const repPercentage = active
    ? userRep.times(100).div(totalSupply).toFixed(4)
    : bnum(0);

  const votingMachineTokens = _.uniq(
    Object.keys(votingMachines).map((votingMachineAddress, i) =>
      configStore
        .getTokensOfNetwork()
        .find(
          token => token.address === votingMachines[votingMachineAddress].token
        )
    )
  );

  const votingMachineBalances = useBalances(
    account
      ? votingMachineTokens.map(votingMachineToken => ({
          assetAddress: votingMachineToken.address,
          fromAddress: account,
        }))
      : []
  );
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
      {!active ? (
        <NavSection>
          <Web3ConnectStatus text="Connect Wallet" />
          <NavItem route={`/config`}>
            <a>
              <FiSettings style={{ margin: '0px 10px', color: '#616161' }} />
            </a>
          </NavItem>
        </NavSection>
      ) : blockchainStore.initialLoadComplete ? (
        <NavSection>
          {account && (
            <>
              {votingMachineTokens.map((votingMachineToken, i) => {
                const votingMachineTokenBalance = bnum(
                  votingMachineBalances[i] || '0'
                );
                return (
                  <ItemBox key={i}>
                    {formatCurrency(
                      normalizeBalance(votingMachineTokenBalance)
                    )}{' '}
                    {votingMachineToken.symbol}{' '}
                  </ItemBox>
                );
              })}
              {repPercentage.toString() !== 'NaN' && (
                <ItemBox> {repPercentage.toString()} % REP </ItemBox>
              )}
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
});

export default Header;
