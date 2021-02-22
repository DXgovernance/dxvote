import React from 'react';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import Web3ConnectStatus from '../Web3ConnectStatus';
import { useStores } from '../../contexts/storesContext';
import { FiSettings } from "react-icons/fi";

import Web3 from 'web3';

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
    ({ option, route, history, location, children }) => {
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
      root: { daoStore },
  } = useStores();
  daoStore.getDaoInfo();

  const dxdBalance = daoStore.daoInfo.userVotingMachineTokenBalance ?
    parseFloat(Number(Web3.utils.fromWei(daoStore.daoInfo.userVotingMachineTokenBalance.toString())).toFixed(4))
    : 0;
  const repBalance = daoStore.daoInfo.userRep ?
    parseFloat(Number(Web3.utils.fromWei(daoStore.daoInfo.userRep.toString())).toFixed(4))
    : 0
    
  return (
    <NavWrapper>
      <NavSection>
        <NavItem route="/">
          <img alt="dxdao" src={require("assets/images/DXdao.svg")}/>
        </NavItem>
      </NavSection>
      <NavSection>
        <BalanceItem> {dxdBalance} DXD </BalanceItem>
        <BalanceItem> {repBalance} REP </BalanceItem>
        <Web3ConnectStatus text="Connect Wallet" />
        <a href={"/#/config"}><FiSettings style={{margin: "0px 10px", color: "#616161"}}/></a>
      </NavSection>
    </NavWrapper>
  );
});

export default Header;
