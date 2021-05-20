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

  return (
    <FooterWrapper>
      <LeftFooter>
        <FooterItem>
          <a href="https://dxvote.eth.link" target="#" > Stable Version </a>
        </FooterItem>
        <FooterDivider></FooterDivider>
        <FooterItem>
          <a href="https://augustol.github.io/dxvote/" target="#" > Developer Version </a>
        </FooterItem>
        <FooterDivider></FooterDivider>
        <FooterItem>
          <a href="https://daotalk.org/c/daos/dx-dao" target="#"> Forum </a>
        </FooterItem>
        <FooterDivider></FooterDivider>
        <FooterItem>
        <a href="https://github.com/AugustoL/dxvote" target="#" > Source Code </a>
        </FooterItem>
      </LeftFooter>
    </FooterWrapper>

  );
};

export default Footer;
