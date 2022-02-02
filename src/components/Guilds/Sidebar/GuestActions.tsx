import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from 'components/Guilds/common/Button';
import { Modal } from '../common/Modal';
import { StakeTokens } from './StakeTokens';
import { useTokenAddress } from '../../../hooks/Guilds/ether-swr/useTokenAddress';
import { useERC20Info } from '../../../hooks/Guilds/ether-swr/erc20/useERC20Info';

export const GuestActions = ({ onJoin }) => {
  const [showJoin, setShowJoin] = useState(false);

  const { guild_id: guildAddress } = useParams<{ guild_id?: string }>();
  const { data: tokenAddress } = useTokenAddress(guildAddress);
  const { data: token } = useERC20Info(tokenAddress);

  return (
    <>
      <Button onClick={() => setShowJoin(true)}>Join</Button>
      <Modal
        header={`Stake ${token?.name} tokens`}
        isOpen={showJoin}
        onDismiss={() => setShowJoin(false)}
        maxWidth={300}
      >
        <StakeTokens onJoin={onJoin} />
      </Modal>
    </>
  );
};
