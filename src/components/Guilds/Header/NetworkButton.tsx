import { observer } from 'mobx-react';
import { getChains, isChainIdSupported } from 'provider/connectors';
import { useContext } from '../../../contexts';
import { Button, ButtonIcon, IconButton } from '../common/Button';

import arbitrumIcon from '../../../assets/images/arbitrum.png';
import ethereumIcon from '../../../assets/images/ethereum.svg';
import xdaiIcon from '../../../assets/images/xdai.svg';
import { useWeb3React } from '@web3-react/core';
import NetworkModal from '../Modal/NetworkModal';

const iconsByChain = {
  1: ethereumIcon,
  4: ethereumIcon,
  100: xdaiIcon,
  42161: arbitrumIcon,
  421611: arbitrumIcon,
  1337: ethereumIcon,
};

const NetworkButton = observer(() => {
  const {
    context: { modalStore },
  } = useContext();

  const { chainId, error } = useWeb3React();
  const chainName =
    getChains().find(chain => chain.id === chainId)?.displayName || null;

  const toggleNetworkModal = () => {
    modalStore.toggleNetworkModal();
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
      <NetworkModal />
    </>
  );
});

export default NetworkButton;
