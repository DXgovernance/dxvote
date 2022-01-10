import { getChains, injected } from 'provider/connectors';
import { useEffect, useState } from 'react';
import { useRpcUrls } from 'provider/providerHooks';
import { Button } from '../common/Button';
import { useWeb3React } from '@web3-react/core';
import WalletModal from '../Web3Modals/WalletModal';
import AddressButton from '../AddressButton';

const Web3Status = () => {
  const { account, chainId } = useWeb3React();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);


  const [injectedWalletAuthorized, setInjectedWalletAuthorized] =
    useState(false);
  const rpcUrls = useRpcUrls();

  useEffect(() => {
    injected.isAuthorized().then(isAuthorized => {
      setInjectedWalletAuthorized(isAuthorized);
    });
  }, []);

  const toggleWalletModal = () => {
    setIsWalletModalOpen(!isWalletModalOpen);
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

  // TODO: change this based on store.
  const transactionsCounter = 2;

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
        <AddressButton
          address={account}
          transactionsCounter={transactionsCounter}
          onClick={toggleWalletModal}
        />
      );
    } else {
      return <Button onClick={toggleWalletModal}>Connect Wallet</Button>;
    }
  }

  return (
    <>
      {getWalletStatus()}
      <WalletModal isOpen={isWalletModalOpen} onClose={toggleWalletModal} />
    </>
  );
};

export default Web3Status;
