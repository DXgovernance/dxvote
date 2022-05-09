import { useWeb3React } from '@web3-react/core';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { Box, Container } from '../../../Components/Primitives/Layout';
import { Heading } from '../common/Typography';
import NetworkButton from './NetworkButton';
import WalletButton from './WalletButton';

const HeaderWrapper = styled.nav`
  padding: 0.75rem 0;

  position: -webkit-sticky;
  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.colors.background};
  z-index: 200;
  @media only screen and(min-width: 768px) {
    padding: 1.5rem 0;
  }

  border-bottom: 1px solid ${({ theme }) => theme.colors.muted};
`;

const HeaderContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const MenuItems = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: auto;
`;

const ClickableHeading = styled(Heading)`
  cursor: pointer;
`;

const Header = () => {
  const history = useHistory();
  const { active, error } = useWeb3React();

  return (
    <HeaderWrapper as="header">
      <HeaderContainer>
        <ClickableHeading onClick={() => history.push('/')} size={2}>
          <strong>Guilds</strong>
        </ClickableHeading>
        {active && !error && (
          <MenuItems>
            <NetworkButton />
            <WalletButton />
          </MenuItems>
        )}
      </HeaderContainer>
    </HeaderWrapper>
  );
};

export default Header;
