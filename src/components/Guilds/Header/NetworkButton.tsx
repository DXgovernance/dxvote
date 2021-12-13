import { useState } from 'react';
import { useWeb3React } from '@web3-react/core';

import { getChains, isChainIdSupported } from 'provider/connectors';
import { Button, ButtonIcon, IconButton } from '../common/Button';
import NetworkModal from '../NetworkModal';
import arbitrumIcon from '../../../assets/images/arbitrum.png';
import ethereumIcon from '../../../assets/images/ethereum.svg';
import xdaiIcon from '../../../assets/images/xdai.svg';

const iconsByChain = {
  1: ethereumIcon,
  4: ethereumIcon,
  100: xdaiIcon,
  42161: arbitrumIcon,
  421611: arbitrumIcon,
  1337: ethereumIcon,
};

const NetworkButton = () => {
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);

  const { chainId, error } = useWeb3React();
  const chainName =
    getChains().find(chain => chain.id === chainId)?.displayName || null;

  const toggleNetworkModal = () => {
    setIsNetworkModalOpen(!isNetworkModalOpen);
  };

  function getNetworkStatus() {
    if ((chainId && !isChainIdSupported(chainId)) || error) {
      return <Button onClick={toggleNetworkModal}>Unsupported Network</Button>;
    } else if (chainId) {
      return (
        <IconButton onClick={toggleNetworkModal} iconLeft>
          <ButtonIcon src={iconsByChain[chainId]} alt={'Icon'} />
          {chainName}
        </IconButton>
      );
    } else {
      return (
        <Button onClick={toggleNetworkModal} active={true}>
          Not Connected
        </Button>
      );
    }
  }

  return (
    <>
      {getNetworkStatus()}
      <NetworkModal isOpen={isNetworkModalOpen} onClose={toggleNetworkModal} />
    </>
  );
};

export default NetworkButton;
