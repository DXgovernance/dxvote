import React from 'react';
import styled from 'styled-components';
import { etherscanAddress, etherscanToken } from 'utils/etherscan';
import { useStores } from '../../contexts/storesContext';

const FooterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 24px 0px 32px;
  color: var(--footer-text-gray);
  flex-grow: 1;
`;

const LeftFooter = styled.div`
margin-top: auto;
  display: flex;
  flex-direction: row;
`;

const RighFooter = styled.div`
margin-top: auto;
  display: flex;
  flex-direction: row;
`;

const FooterItem = styled.div`
  a {
    text-decoration: none;
    color: var(--footer-text-gray);
  }
  a:hover {
    color: var(--text-gray-onHover);
  }a
    
`;

const FooterDivider = styled.div`
  background: var(--footer-text-gray);
  width: 4px;
  height: 4px;
  border-radius: 2px;
  line-height: 24px;
  margin: 7px;
`;

const LogoWrapper = styled.div`
  width: 20px;
  padding-left: 8px;
`;

const FooterLogo = styled.img`
  :hover {
    filter: invert(48%) sepia(13%) saturate(281%) hue-rotate(154deg)
      brightness(97%) contrast(86%);
  }
`;

const Footer = () => {
  const {
    root: {providerStore, configStore},
  } = useStores();

  let chainId = providerStore.getActiveWeb3React().chainId;
  let proxyContract = configStore.getNetworkConfig().DAT;
  let contract = configStore.getNetworkConfig().implementationAddress;
  return (
    <FooterWrapper>
      <LeftFooter>
        <FooterItem>
          <a
            href={
              'https://github.com/augustol/dxvote/tree/v'+process.env.REACT_APP_VERSION
            }
            target="#"
          >
            Version {process.env.REACT_APP_VERSION}
          </a>
        </FooterItem>
        <FooterDivider></FooterDivider>
        <FooterItem>
          <a href="https://daotalk.org/c/daos/dx-dao" target="#">
            Forum
          </a>
        </FooterItem>
        <FooterDivider></FooterDivider>
        <FooterItem>
          <a
            href="https://alchemy.daostack.io/dao/0x519b70055af55a007110b4ff99b0ea33071c720a"
            target="#"
          >
            Alchemy
          </a>
        </FooterItem>
    </LeftFooter>
    <RighFooter>
        <LogoWrapper>
          <a href="https://twitter.com/dxdao_" target="#">
            <FooterLogo src={require('assets/images/twitter.svg')}></FooterLogo>
          </a>
        </LogoWrapper>
        <LogoWrapper>
          <a href="https://www.reddit.com/r/dxdao/" target="#">
            <FooterLogo src={require('assets/images/reddit.svg')}></FooterLogo>
          </a>
        </LogoWrapper>
        <LogoWrapper>
          <a href="https://t.me/dxDAO" target="#">
            <FooterLogo src={require('assets/images/telegram.svg')}></FooterLogo>
          </a>
        </LogoWrapper>
      </RighFooter>
    </FooterWrapper>

  );
};

export default Footer;
