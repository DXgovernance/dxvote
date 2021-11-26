import styled from 'styled-components';
import { Box, Container } from '../common/Layout';
import NetworkButton from './NetworkButton';
import WalletButton from './WalletButton';

const HeaderWrapper = styled(Box)`
  padding: 0.75rem 0;

  @media only screen and (min-width: 768px) {
    padding: 1.5rem 0;
  }
  border-bottom: 1px solid ${({ theme }) => theme.colors.muted};
`;

const HeaderContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
`;

const MenuItems = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: auto;
`;

const AppLogo = styled(Box)`
  font-weight: 600;
  font-size: 1.25rem;
`;

const Header = () => {
  return (
    <HeaderWrapper as="header">
      <HeaderContainer>
        <AppLogo>DXvote</AppLogo>
        <MenuItems>
          <NetworkButton />
          <WalletButton />
        </MenuItems>
      </HeaderContainer>
    </HeaderWrapper>
  );
};

export default Header;
