import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getChains, injected } from 'provider/connectors';
import { useRpcUrls } from 'provider/providerHooks';
import { Button } from 'old-components/Guilds/common/Button';
import { useWeb3React } from '@web3-react/core';
import WalletModal from 'old-components/Guilds/Web3Modals/WalletModal';
import AddressButton from 'Components/AddressButton/AddressButton';
import { useTransactions } from 'contexts/Guilds';

const WalletButton = () => {
  const { t } = useTranslation();
  const { account, chainId } = useWeb3React();
  const { transactions } = useTransactions();
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
  };

  function getWalletStatus() {
    if (injectedWalletAuthorized && !account) {
      const chains = getChains(rpcUrls);
      const activeChain =
        chains.find(chain => chain.id === chainId) || chains[0];

      const isMetamask = window.ethereum && window.ethereum.isMetaMask;

      return (
        <Button variant="secondary" onClick={() => switchNetwork(activeChain)}>
          {t('switch')} {isMetamask ? 'MetaMask' : t('wallet')} {t('to')}{' '}
          {activeChain.displayName}
        </Button>
      );
    } else if (account) {
      return (
        <AddressButton
          address={account}
          transactionsCounter={
            transactions?.filter(transaction => !transaction.receipt)?.length ??
            0
          }
          onClick={toggleWalletModal}
        />
      );
    } else {
      return (
        <Button data-testid="connectWalletBtn" onClick={toggleWalletModal}>
          {t('connectWallet')}
        </Button>
      );
    }
  }

  return (
    <>
      {getWalletStatus()}
      <WalletModal isOpen={isWalletModalOpen} onClose={toggleWalletModal} />
    </>
  );
};

export default WalletButton;
