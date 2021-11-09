import styled from 'styled-components';
import { Box, Container } from '../common/Layout';
import dxIcon from '../../../assets/images/dxdao-icon.svg';
import ethIcon from '../../../assets/images/ethereum.svg';
import { IconButton } from '../common/Button';

const HeaderWrapper = styled(Box)`
  border-bottom: 1px solid #000;
  padding: 1.5rem 0;
`;

const HeaderContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
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

const ButtonIcon = styled.img`
  height: 1.1rem;
  width: 1.1rem;
`;

const Header = () => {
  return (
    <HeaderWrapper>
      <HeaderContainer>
        <AppLogo>DXvote</AppLogo>
        <MenuItems>
          <IconButton iconLeft>
            <ButtonIcon src={ethIcon} alt={'Icon'} />
            Ethereum
          </IconButton>

          <IconButton iconLeft>
            <ButtonIcon src={dxIcon} alt={'Icon'} />
            geronimo.eth
          </IconButton>
        </MenuItems>
      </HeaderContainer>
    </HeaderWrapper>
  );
};

export default Header;
