import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import Web3ConnectStatus from '../Web3ConnectStatus';

const NavWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 50px 0px 40px 0px;
`;

const LeftNav = styled.div`
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

const Header = () => {
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

  return (
    <NavWrapper>
      <LeftNav>
        <NavItem route="/">
          <img alt="dxdao" src={require("assets/images/DXdao.svg")}/>
        </NavItem>
      </LeftNav>
      <Web3ConnectStatus text="Connect Wallet" />
    </NavWrapper>
  );
};

export default Header;
