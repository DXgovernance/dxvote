import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';

import { Modal } from '../Modal';
import Option from './Option';
import { getChains } from 'provider/connectors';
import { useContext } from '../../contexts';
import { useActiveWeb3React, useRpcUrls } from 'provider/providerHooks';

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
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-gap: 10px;
  `};
`;

const NetworkModal = observer(() => {
  const {
    context: { modalStore },
  } = useContext();
  const { chainId } = useActiveWeb3React();
  const rpcUrls = useRpcUrls();
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

  // get networks user can switch to
  function getOptions() {
    if (!rpcUrls) return [];

    const chains = getChains(rpcUrls);
    return Object.entries(chains).map(([key, option]) => {
      return (
        <Option
          // onClick={() => {
          //   option.connector !== connector &&
          //     !option.href &&
          //     tryActivation(option.connector);
          // }}
          key={key}
          icon={null}
          active={option.chainId === chainId}
          color={"red"}
          header={option.name}
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
