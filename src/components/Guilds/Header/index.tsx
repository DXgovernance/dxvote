import styled from 'styled-components';
import { isDesktop } from 'react-device-detect';
import { Box, Container } from '../common/Layout';
import dxIcon from '../../../assets/images/dxdao-icon.svg';
import ethIcon from '../../../assets/images/ethereum.svg';
import { IconButton } from '../common/Button';
import { Heading } from '../common/Typography';

const HeaderWrapper = styled(Box)`
  padding: 0.75rem 0;

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
`;

const MenuItems = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: auto;
`;

const ButtonIcon = styled.img`
  height: 1.1rem;
  width: 1.1rem;
`;

const Header = () => {
  return (
    <HeaderWrapper as="header">
      <HeaderContainer>
        <Heading size={2}>
          <strong>DXvote</strong>
        </Heading>
        <MenuItems>
          <IconButton iconLeft>
            <ButtonIcon src={ethIcon} alt={'Icon'} />
            Ethereum
          </IconButton>

          <IconButton iconLeft>
            <ButtonIcon src={dxIcon} alt={'Icon'} />
            {isDesktop && <span>geronimo.eth</span>}
          </IconButton>
        </MenuItems>
      </HeaderContainer>
    </HeaderWrapper>
  );
};

export default Header;
