import { observer } from 'mobx-react';
import { isDesktop } from 'react-device-detect';
import WalletModal from 'components/WalletModal';
import { getChains, injected } from 'provider/connectors';
import { useEffect, useState } from 'react';
import { useRpcUrls } from 'provider/providerHooks';
import { useContext } from '../../../contexts';
import { Button, IconButton } from '../common/Button';
import useENSAddress from '../../../hooks/useENSAddress';
import Avatar from '../Avatar';

const Web3Status = observer(() => {
  const {
    context: { modalStore, providerStore },
  } = useContext();
  const [injectedWalletAuthorized, setInjectedWalletAuthorized] =
    useState(false);
  const rpcUrls = useRpcUrls();

  useEffect(() => {
    injected.isAuthorized().then(isAuthorized => {
      setInjectedWalletAuthorized(isAuthorized);
    });
  }, [injected]);

  const { chainId, account } = providerStore.getActiveWeb3React();

  const { ensName, avatarUri } = useENSAddress(account);

  const toggleWalletModal = () => {
    modalStore.toggleWalletModal();
  };

  const switchNetwork = async chain => {
    const chainIdHex = `0x${chain.id.toString(16)}`;
    try {
      await window.ethereum?.send('wallet_switchEthereumChain', [
        { chainId: chainIdHex },
      ]);
    } catch (e: any) {
      if (e?.code == 4902) {
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
  };

  function getWalletStatus() {
    if (injectedWalletAuthorized && !account) {
      const chains = getChains(rpcUrls);
      const activeChain =
        chains.find(chain => chain.id == chainId) || chains[0];
      const isMetamask = window.ethereum && window.ethereum.isMetaMask;

      return (
        <Button onClick={() => switchNetwork(activeChain)}>
          Switch {isMetamask ? 'MetaMask' : 'Wallet'} to{' '}
          {activeChain.displayName}
        </Button>
      );
    } else if (account) {
      return (
        <IconButton onClick={toggleWalletModal} iconLeft>
          <Avatar avatarUri={avatarUri} />
          {isDesktop && <span>{ensName || account}</span>}
        </IconButton>
      );
    } else {
      return <Button onClick={toggleWalletModal}>Connect Wallet</Button>;
    }
  }

  return (
    <>
      {getWalletStatus()}
      <WalletModal />
    </>
  );
});

export default Web3Status;
