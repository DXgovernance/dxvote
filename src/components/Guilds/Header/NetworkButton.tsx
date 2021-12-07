import { observer } from 'mobx-react';
import { isChainIdSupported } from 'provider/connectors';
import NetworkModal from 'components/NetworkModal';
import { useContext } from '../../../contexts';
import { toCamelCaseString } from '../../../utils';
import { Button, ButtonIcon, IconButton } from '../common/Button';

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

const NetworkButton = observer(() => {
  const {
    context: { modalStore, providerStore, configStore },
  } = useContext();

  const { chainId, error } = providerStore.getActiveWeb3React();

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
          {toCamelCaseString(configStore.getActiveChainName())}
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
