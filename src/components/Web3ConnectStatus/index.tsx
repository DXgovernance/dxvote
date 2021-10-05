import styled from 'styled-components';
import { observer } from 'mobx-react';
import { shortenAddress, toCamelCaseString } from '../../utils';
import WalletModal from 'components/WalletModal';
import { isChainIdSupported } from 'provider/connectors';
import { useContext } from '../../contexts';
import { Box } from '../../components/common';
import NetworkModal from 'components/NetworkModal';

const WrongNetworkButton = styled(Box)`
  color: var(--dark-text-gray);
  padding: 5px 10px;
  font-weight: 500;
  font-size: 16px;
  height: 28px;
  border-radius: 6px;
  background: var(--wrong-network);
  color: var(--white);
  cursor: pointer;
`;

const AccountButton = styled(Box)`
  color: var(--dark-text-gray);
  padding: 5px 10px;
  font-weight: 500;
  font-size: 16px;
  margin-right: 10px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
`;

const ConnectButton = styled(Box)`
  color: var(--dark-text-gray);
  padding: 5px 10px;
  font-weight: 500;
  font-size: 16px;
  height: 28px;
  border-radius: 6px;
  background: var(--blue-text);
  color: var(--white);
  cursor: pointer;
`;

const Web3ConnectStatus = observer(props => {
  const {
    context: { modalStore, providerStore, configStore },
  } = useContext();
  const { chainId, account, error } = providerStore.getActiveWeb3React();

  const toggleWalletModal = () => {
    modalStore.toggleWalletModal();
  };

  const toggleNetworkModal = () => {
    modalStore.toggleNetworkModal();
  };

  function getWalletStatus() {
    console.debug('[GetWalletStatus]', { account });
    if (account) {
      return (
        <AccountButton onClick={toggleWalletModal}>
          {shortenAddress(account)}
        </AccountButton>
      );
    } else {
      return (
        <ConnectButton onClick={toggleWalletModal} active={true}>
          {props.text}
        </ConnectButton>
      );
    }
  }

  function getNetworkStatus() {
    console.debug('[GetNetworkStatus]', { chainId, error });
    // Wrong network
    if ((chainId && !isChainIdSupported(chainId)) || error) {
      return (
        <WrongNetworkButton onClick={toggleNetworkModal}>
          Wrong Network
        </WrongNetworkButton>
      );
    } else if (chainId) {
      return (
        <div style={{ display: 'flex' }}>
          <AccountButton
            onClick={toggleNetworkModal}
            style={{ fontSize: '14px' }}
          >
            {toCamelCaseString(configStore.getActiveChainName())}
          </AccountButton>
        </div>
      );
    } else {
      return (
        <ConnectButton onClick={toggleNetworkModal} active={true}>
          Not Connected
        </ConnectButton>
      );
    }
  }

  return (
    <>
      {getNetworkStatus()}
      {getWalletStatus()}
      <WalletModal />
      <NetworkModal />
    </>
  );
});

export default Web3ConnectStatus;
