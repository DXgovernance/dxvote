import { isDesktop } from 'react-device-detect';
import styled from 'styled-components';
import { getChains, injected } from 'provider/connectors';
import { useEffect, useMemo, useState } from 'react';
import { useRpcUrls } from 'provider/providerHooks';
import { Button, IconButton } from '../common/Button';
import useENSAvatar from '../../../hooks/Guilds/ens/useENSAvatar';
import Avatar from '../Avatar';
import { shortenAddress } from '../../../utils';
import { useWeb3React } from '@web3-react/core';
import WalletModal from '../Web3Modals/WalletModal';
import { Badge } from '../common/Badge';
import { MAINNET_WEB3_ROOT_KEY } from '../Web3Manager/MainnetWeb3Manager';

const IconHolder = styled.span`
  display: flex;
  justify-content: center;

  @media only screen and (min-width: 768px) {
    margin-right: 0.3rem;
  }

  img {
    border-radius: 50%;
    margin-right: 0;
  }
`;

const AccountButton = styled(IconButton)`
  margin-top: 0;
  margin-bottom: 0;
  padding: 0.3rem;

  @media only screen and (min-width: 768px) {
    padding: 0.3rem 0.5rem;
  }

  /* hover state for when having child Badge */
  &:hover,
  &:active {
    ${Badge} {
      background-color: ${({ theme }) => theme.colors.background};
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const AddressText = styled.span`
  margin-left: 0.2rem;
  margin-right: 0.3rem;
`;

const Web3Status = () => {
  const { account, chainId } = useWeb3React();
  const { ensName, imageUrl, avatarUri } = useENSAvatar(
    account,
    MAINNET_WEB3_ROOT_KEY
  );
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  let imageUrlToUse = useMemo(() => {
    if (avatarUri) {
      return (
        imageUrl || `https://metadata.ens.domains/mainnet/avatar/${ensName}`
      );
    } else {
      return null;
    }
  }, [imageUrl, ensName, avatarUri]);

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
        <AccountButton onClick={toggleWalletModal} iconLeft>
          <IconHolder>
            <Avatar src={imageUrlToUse} defaultSeed={account} size={24} />
          </IconHolder>
          {isDesktop && (
            <AddressText>{ensName || shortenAddress(account)}</AddressText>
          )}
          {transactionsCounter && (
            <Badge size="25">{transactionsCounter}</Badge>
          )}
        </AccountButton>
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
