import React from 'react';
import styled from 'styled-components';

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

const Footer = () => {
  return (
    <FooterWrapper>
      <LeftFooter>
        <FooterItem>
          <a href="https://dxdao.eth.link/#/" target="_blank" > Website </a>
        </FooterItem>
        <FooterDivider></FooterDivider>
        <FooterItem>
          <a href="dxvote/#/forum" target="_self" > Forum </a>
        </FooterItem>
        <FooterDivider></FooterDivider>
        <FooterItem>
        <a href="https://github.com/AugustoL/dxvote" target="_blank" > Source Code </a>
        </FooterItem>
        <FooterDivider></FooterDivider>
        <FooterItem>
        <a href="dxvote/#/faq" target="_self" > FAQ </a>
        </FooterItem>
        <FooterDivider></FooterDivider>
        <FooterItem>
        <a href="https://github.com/AugustoL/dxvote/issues/new/choose" target="_blank" > Submit Issue </a>
        </FooterItem>
      </LeftFooter>
    </FooterWrapper>

  );
};

export default Footer;
