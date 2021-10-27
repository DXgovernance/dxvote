import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { isMobile } from 'react-device-detect';
import { observer } from 'mobx-react';

import { Modal } from '../Modal';
import AccountDetails from '../AccountDetails';
import Option from './Option';
import { usePrevious } from 'utils';
import Link from '../../components/common/Link';
import { injected, getWallets } from 'provider/connectors';
import { useContext } from '../../contexts';
import { isChainIdSupported } from '../../provider/connectors';
import { useRpcUrls } from 'provider/providerHooks';
import { useWeb3React } from '@web3-react/core';

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.backgroundColor};
  border-radius: 10px;
`;

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 1.5rem 1.5rem;
  font-weight: 500;
  color: var(--header-text);
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`;

const ContentWrapper = styled.div`
  background-color: var(--panel-background);
  color: var(--body-text);
  padding: 2rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
`;

const UpperSection = styled.div`
  position: relative;
  background-color: var(--panel-background);

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`;

const Blurb = styled.div`
  ${({ theme }) => theme.flexRowWrap}
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 1rem;
    font-size: 12px;
  `};
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-gap: 10px;
  `};
`;

const HoverText = styled.div`
  :hover {
    cursor: pointer;
  }
`;

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
};

const WalletModal = observer(() => {
  const {
    context: { modalStore },
  } = useContext();
  const { active, connector, error, activate, account, chainId } =
    useWeb3React();
  const rpcUrls = useRpcUrls();
  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);
  const [connectionErrorMessage, setConnectionErrorMessage] = useState(false);

  const walletModalOpen = modalStore.walletModalVisible;

  const toggleWalletModal = () => {
    modalStore.toggleWalletModal();
  };

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setConnectionErrorMessage(false);
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [walletModalOpen]);

  // close modal when a connection is successful
  const activePrevious = usePrevious(active);
  const connectorPrevious = usePrevious(connector);
  useEffect(() => {
    if (
      walletModalOpen &&
      ((active && !activePrevious) ||
        (connector && connector !== connectorPrevious && !error))
    ) {
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [
    setWalletView,
    active,
    error,
    connector,
    walletModalOpen,
    activePrevious,
    connectorPrevious,
  ]);

  const tryActivation = async connector => {
    setWalletView(WALLET_VIEWS.PENDING);
    activate(connector, undefined, true).catch(e => {
      setConnectionErrorMessage(e);
      console.debug('[Activation Error]', e);
    });
  };

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    if (!rpcUrls) return [];

    const isMetamask = window.ethereum && window.ethereum.isMetaMask;
    const wallets = getWallets(rpcUrls);
    return Object.keys(wallets).map(key => {
      const option = wallets[key];
      // check for mobile options
      if (isMobile) {
        if (!window.ethereum && option.mobile) {
          return (
            <Option
              onClick={() => {
                option.connector !== connector &&
                  !option.href &&
                  tryActivation(option.connector);
              }}
              key={key}
              icon={option.icon}
              active={option.connector && option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
            />
          );
        }
        return null;
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        if (!window.ethereum) {
          if (option.name === 'MetaMask') {
            return (
              <Option
                key={key}
                color={'#E8831D'}
                icon={option.icon}
                header={'Install Metamask'}
                subheader={null}
                link={'https://metamask.io/'}
              />
            );
          } else {
            return null; //dont want to return install twice
          }
        }
        // don't return metamask if injected provider isn't metamask
        else if (option.name === 'MetaMask' && !isMetamask) {
          return null;
        }
        // likewise for generic
        else if (option.name === 'Injected' && isMetamask) {
          return null;
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            onClick={() => {
              option.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : !option.href && tryActivation(option.connector);
            }}
            key={key}
            active={option.connector === connector}
            color={option.color}
            icon={option.icon}
            link={option.href}
            header={option.name}
            subheader={null} //use option.descriptio to bring back multi-line
          />
        )
      );
    });
  }

  function getModalContent() {
    if (connectionErrorMessage) {
      return (
        <UpperSection>
          <HeaderRow>
            {connectionErrorMessage
              .toString()
              .indexOf('UnsupportedChainIdError') >= 0
              ? 'Wrong Network'
              : 'Error connecting'}
          </HeaderRow>
          <ContentWrapper>
            {connectionErrorMessage
              .toString()
              .indexOf('UnsupportedChainIdError') >= 0 ? (
              <h5> Please connect to a valid ethereum network. </h5>
            ) : (
              'Error connecting. Try refreshing the page.'
            )}
          </ContentWrapper>
        </UpperSection>
      );
    }
    if (
      account &&
      !isChainIdSupported(chainId) &&
      walletView === WALLET_VIEWS.ACCOUNT
    ) {
      return (
        <UpperSection>
          <HeaderRow>{'Wrong Network'}</HeaderRow>
          <ContentWrapper>
            <h5>Please connect to a valid ethereum network.</h5>
          </ContentWrapper>
        </UpperSection>
      );
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <AccountDetails
          openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
        />
      );
    }
    return (
      <UpperSection>
        <ContentWrapper>
          <OptionGrid>{getOptions()}</OptionGrid>
          {walletView !== WALLET_VIEWS.PENDING && (
            <Blurb>
              <span style={{ color: '#90a4ae' }}>New to Ethereum? &nbsp;</span>{' '}
              <Link href="https://ethereum.org/use/#3-what-is-a-wallet-and-which-one-should-i-use">
                Learn more about wallets
              </Link>
            </Blurb>
          )}
        </ContentWrapper>
      </UpperSection>
    );
  }

  const Header = (
    <div>
      {walletView !== WALLET_VIEWS.ACCOUNT ? (
        <HoverText
          onClick={() => {
            setWalletView(WALLET_VIEWS.ACCOUNT);
          }}
        >
          Back
        </HoverText>
      ) : walletView === WALLET_VIEWS.ACCOUNT ? (
        'Account'
      ) : (
        'Connect to a wallet'
      )}
    </div>
  );

  return (
    <Modal
      header={Header}
      isOpen={walletModalOpen}
      onDismiss={toggleWalletModal}
    >
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  );
});

export default WalletModal;
