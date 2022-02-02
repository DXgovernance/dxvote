import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { Button } from 'components/Guilds/common/Button';
import { Modal } from '../common/Modal';
import { StakeTokens } from './StakeTokens';
import { useERC20Info } from '../../../hooks/Guilds/ether-swr/erc20/useERC20Info';
import { useGuildConfig } from '../../../hooks/Guilds/ether-swr/useGuildConfig';

export const GuestActions = ({ onJoin }) => {
  const [showJoin, setShowJoin] = useState(false);

  const { guild_id: guildAddress } = useParams<{ guild_id?: string }>();
  const { data } = useGuildConfig(guildAddress);
  const { data: token } = useERC20Info(data?.token);

  return (
    <>
      <Button onClick={() => setShowJoin(true)}>Join</Button>
      <Modal
        header={token ? `Stake ${token.name} tokens` : <Skeleton width={100} />}
        isOpen={showJoin}
        onDismiss={() => setShowJoin(false)}
        maxWidth={300}
      >
        <StakeTokens onJoin={onJoin} />
      </Modal>
    </>
  );
};
