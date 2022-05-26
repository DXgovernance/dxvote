import { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useTranslation } from 'react-i18next';

import { isChainIdSupported } from 'provider/connectors';
import { getNetworkById, getChainIcon } from 'utils';
import {
  Button,
  ButtonIcon,
  IconButton,
} from 'old-components/Guilds/common/Button';
import NetworkModal from 'old-components/Guilds/Web3Modals/NetworkModal';

const NetworkButton = () => {
  const { t } = useTranslation();
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);

  const { chainId, error } = useWeb3React();
  const chainName = getNetworkById(chainId)?.displayName || null;

  const toggleNetworkModal = () => {
    setIsNetworkModalOpen(!isNetworkModalOpen);
  };

  function getNetworkStatus() {
    if ((chainId && !isChainIdSupported(chainId)) || error) {
      return (
        <Button onClick={toggleNetworkModal}>{t('unsupportedNetwork')}</Button>
      );
    } else if (chainId) {
      return (
        <IconButton onClick={toggleNetworkModal} iconLeft>
          <ButtonIcon src={getChainIcon(chainId)} alt={'Icon'} />
          {chainName}
        </IconButton>
      );
    } else {
      return <Button onClick={toggleNetworkModal}>{t('notConnected')}</Button>;
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
