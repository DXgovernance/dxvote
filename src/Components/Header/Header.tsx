import { useWeb3React } from '@web3-react/core';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { NetworkButton } from '../NetworkButton';
import { WalletButton } from '../WalletButton';
import {
  HeaderWrapper,
  HeaderContainer,
  MenuItems,
  ClickableHeading,
} from './Header.styled';

const Header = () => {
  const history = useHistory();
  const { active, error } = useWeb3React();
  const { t } = useTranslation();

  return (
    <HeaderWrapper as="header">
      <HeaderContainer>
        <ClickableHeading onClick={() => history.push('/')} size={2}>
          <strong>{t('guilds.guilds')}</strong>
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
