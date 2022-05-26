import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { InjectedConnector } from '@web3-react/injected-connector';
import { useHistory } from 'react-router-dom';
import { Modal } from '../Modal';
import Option from './Option';
import { useContext } from 'contexts';
import { useRpcUrls } from 'provider/providerHooks';
import { getChains } from 'provider/connectors';
import { getChainIcon } from 'utils';

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.backgroundColor};
  border-radius: 10px;
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

const OptionGrid = styled.div`
  display: flex;
  flex-direction: column;
`;

const NetworkModal = observer(() => {
  const {
    context: { modalStore, providerStore },
  } = useContext();
  const { chainId, connector, deactivate } = providerStore.getActiveWeb3React();
  const rpcUrls = useRpcUrls();
  const history = useHistory();
  const [networkErrorMessage, setNetworkErrorMessage] = useState(false);

  const networkModalOpen = modalStore.networkModalVisible;

  const toggleNetworkModal = () => {
    modalStore.toggleNetworkModal();
  };

  // always reset to options view
  useEffect(() => {
    if (networkModalOpen) {
      setNetworkErrorMessage(false);
    }
  }, [networkModalOpen]);

  const trySwitching = async chain => {
    if (connector instanceof InjectedConnector) {
      const chainIdHex = `0x${chain.id.toString(16)}`;
      try {
        await window.ethereum?.send('wallet_switchEthereumChain', [
          { chainId: chainIdHex },
        ]);
      } catch (e: any) {
        if (e?.code === 4902) {
          window.ethereum?.send('wallet_addEthereumChain', [
            {
              chainId: chainIdHex,
              chainName: chain.displayName,
              nativeCurrency: chain.nativeAsset,
              rpcUrls: [chain.rpcUrl, chain.defaultRpc],
              blockExplorerUrls: [chain.blockExplorer],
            },
          ]);
        }
      }
    } else {
      deactivate();
    }

    history.push(`/${chain.name}/proposals`);
  };

  // get networks user can switch to
  function getOptions() {
    if (!rpcUrls) return [];

    const chains = getChains(rpcUrls);
    return chains.map(chain => {
      return (
        <Option
          onClick={() => trySwitching(chain)}
          key={chain.name}
          icon={getChainIcon(chain.id)}
          active={chain.id === chainId}
          header={chain.displayName}
        />
      );
    });
  }

  function getModalContent() {
    return (
      <UpperSection>
        <ContentWrapper>
          <OptionGrid>{getOptions()}</OptionGrid>
        </ContentWrapper>
      </UpperSection>
    );
  }

  return (
    <Modal
      header={<div>Switch network</div>}
      isOpen={networkModalOpen}
      onDismiss={toggleNetworkModal}
    >
      <>
        <Wrapper>{getModalContent()}</Wrapper>
        <div>{networkErrorMessage}</div>
      </>
    </Modal>
  );
});

export default NetworkModal;
