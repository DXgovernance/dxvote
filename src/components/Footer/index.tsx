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
