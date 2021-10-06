import styled from 'styled-components';
import { observer } from 'mobx-react';
import { shortenAddress, toCamelCaseString } from '../../utils';
import WalletModal from 'components/WalletModal';
import { isChainIdSupported } from 'provider/connectors';
import { useContext } from '../../contexts';
import { Box } from '../../components/common';

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

  function getWeb3Status() {
    console.debug('[GetWeb3Status]', {
      account,
      chainId: chainId,
      error,
    });
    // Wrong network
    if (account && chainId && !isChainIdSupported(chainId)) {
      return (
        <WrongNetworkButton onClick={toggleWalletModal}>
          Wrong Network
        </WrongNetworkButton>
      );
    } else if (account) {
      return (
        <div style={{ display: 'flex' }}>
          <AccountButton onClick={toggleWalletModal}>
            {shortenAddress(account)}
          </AccountButton>
          <AccountButton
            onClick={toggleWalletModal}
            style={{ fontSize: '14px' }}
          >
            {toCamelCaseString(configStore.getActiveChainName())}
          </AccountButton>
        </div>
      );
    } else if (error) {
      return (
        <WrongNetworkButton onClick={toggleWalletModal}>
          Wrong Network
        </WrongNetworkButton>
      );
    } else {
      return (
        <ConnectButton onClick={toggleWalletModal} active={true}>
          {props.text}
        </ConnectButton>
      );
    }
  }

  return (
    <>
      {getWeb3Status()}
      <WalletModal />
    </>
  );
});

export default Web3ConnectStatus;
