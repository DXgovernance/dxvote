import { useState } from 'react';
import { Button } from 'components/Guilds/common/Button';
import StakeTokensModal from '../StakeTokensModal';
import { useWeb3React } from '@web3-react/core';
import WalletModal from '../Web3Modals/WalletModal';

export const GuestActions = () => {
  const { account } = useWeb3React();
  const [showJoin, setShowJoin] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  return (
    <>
      <Button variant="secondary"
        onClick={() =>
          account ? setShowJoin(true) : setIsWalletModalOpen(true)
        }
      >
        {account ? 'Join' : 'Connect Wallet'}
      </Button>
      <StakeTokensModal
        isOpen={showJoin}
        onDismiss={() => setShowJoin(false)}
      />
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
};
