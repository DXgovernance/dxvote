import React from 'react';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import Web3ConnectStatus from '../Web3ConnectStatus';
import { useStores } from '../../contexts/storesContext';
import { FiSettings, FiUser, FiBarChart2 } from "react-icons/fi";
import dxdaoIcon from "assets/images/DXdao.svg"
import Web3 from 'web3';
import { bnum } from '../../utils/helpers';
import Box from '../../components/common/Box';

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
      root: { userStore, providerStore, daoStore, blockchainStore, configStore },
  } = useStores();
  
  const votingMachines = configStore.getNetworkConfig().votingMachines;
  const userInfo = userStore.getUserInfo();
  const { active, account } = providerStore.getActiveWeb3React();
  const ethBalance = active && userInfo.ethBalance ?
    parseFloat(Number(Web3.utils.fromWei(userInfo.ethBalance.toString())).toFixed(2))
    : 0;
  const dxdBalance = active && userInfo.dxdBalance ?
    parseFloat(Number(Web3.utils.fromWei(userInfo.dxdBalance.toString())).toFixed(2))
    : 0;
  const genBalance = active && userInfo.genBalance ?
    parseFloat(Number(Web3.utils.fromWei(userInfo.genBalance.toString())).toFixed(2))
    : 0;
    
   const repPercentage = active && daoStore.getDaoInfo().totalRep
    ? bnum(userInfo.repBalance).times(100).div(bnum(daoStore.getDaoInfo().totalRep)).toFixed(4)
    : bnum(0);

  return (
    <NavWrapper>
      <NavSection>
        <NavItem route="/?">
          <img alt="dxdao" src={dxdaoIcon}/>
        </NavItem>
      </NavSection>
      { active && blockchainStore.initialLoadComplete ?
        <NavSection>
          {votingMachines.dxd ? <ItemBox> {dxdBalance} DXD </ItemBox> : <div/> }
          {votingMachines.gen ? <ItemBox> {genBalance} GEN </ItemBox> : <div/> }
          <ItemBox> {repPercentage.toString()} % REP </ItemBox>
          <Web3ConnectStatus text="Connect Wallet" />
          <a href={`${window.location.pathname}#/info`}><FiBarChart2 style={{margin: "0px 10px", color: "#616161"}}/></a>
          <a href={`${window.location.pathname}#/config`}><FiSettings style={{margin: "0px 10px", color: "#616161"}}/></a>
          <a href={`${window.location.pathname}#/user/${account}`}><FiUser style={{margin: "0px 10px", color: "#616161"}}/></a>
        </NavSection>
      : <NavSection>
          <Web3ConnectStatus text="Connect Wallet" />
        </NavSection>
      }
    </NavWrapper>
  );
});

export default Header;
