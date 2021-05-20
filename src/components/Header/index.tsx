import React from 'react';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import Web3ConnectStatus from '../Web3ConnectStatus';
import { useStores } from '../../contexts/storesContext';
import { FiSettings, FiUser } from "react-icons/fi";
import dxdaoIcon from "assets/images/DXdao.svg"
import Web3 from 'web3';
import { bnum } from '../../utils/helpers';

const NavWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 50px 0px 0px 0px;
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

const BalanceItem = styled.div`
  display: flex;
  align-items: center;
  color: var(--dark-text-gray);
  padding:  5px 10px;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  margin-right: 10px;
  height: 40px;

  background: #FFFFFF;
  border: 1px solid #E1E3E7;
  box-sizing: border-box;
  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
`;

const Header = observer(() => {
  const NavItem = withRouter(
    ({ route, history, children }) => {
      return (
        <MenuItem
          onClick={() => {
            history.push(route);
          }}
        >
          {children}
        </MenuItem>
      );
    }
  );
  
  const {
      root: { userStore, providerStore, ipfsService, daoStore },
  } = useStores();
  ipfsService.start();
  const userInfo = userStore.getUserInfo();
  const { active, account } = providerStore.getActiveWeb3React();
  const ethBalance = userInfo.ethBalance ?
    parseFloat(Number(Web3.utils.fromWei(userInfo.ethBalance.toString())).toFixed(4))
    : 0;
  const dxdBalance = userInfo.dxdBalance ?
    parseFloat(Number(Web3.utils.fromWei(userInfo.dxdBalance.toString())).toFixed(4))
    : 0;
  const repBalance = userInfo.repBalance ?
    parseFloat(Number(Web3.utils.fromWei(userInfo.repBalance.toString())).toFixed(4))
    : 0;
    
  const repPercentage = daoStore.getDaoInfo().totalRep
    ? bnum(userInfo.repBalance).div(bnum(daoStore.getDaoInfo().totalRep)).times(100)
    : bnum(0);

  return (
    <NavWrapper>
      <NavSection>
        <NavItem route="/?">
          <img alt="dxdao" src={dxdaoIcon}/>
        </NavItem>
      </NavSection>
      <NavSection>
        <BalanceItem> {ethBalance} ETH </BalanceItem>
        <BalanceItem> {dxdBalance} DXD </BalanceItem>
        <BalanceItem> {repBalance} REP - {repPercentage.toFixed(2)} % </BalanceItem>
        <Web3ConnectStatus text="Connect Wallet" />
        <a href={`${window.location.pathname}#/config`}><FiSettings style={{margin: "0px 10px", color: "#616161"}}/></a>
        {active ?
          <a href={`${window.location.pathname}#/user/${account}`}><FiUser style={{margin: "0px 10px", color: "#616161"}}/></a>
          : <div/>
        }
      </NavSection>
    </NavWrapper>
  );
});

export default Header;
