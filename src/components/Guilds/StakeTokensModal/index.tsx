import { useParams } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { Modal } from '../common/Modal';
import { StakeTokens } from './StakeTokens';
import { useERC20Info } from '../../../hooks/Guilds/ether-swr/erc20/useERC20Info';
import { useGuildConfig } from '../../../hooks/Guilds/ether-swr/useGuildConfig';

interface StakeTokensModalInterface {
  isOpen: boolean;
  onDismiss: () => void;
}

const StakeTokensModal: React.FC<StakeTokensModalInterface> = ({
  isOpen,
  onDismiss,
}) => {
  const { guild_id: guildAddress } = useParams<{ guild_id?: string }>();
  const { data } = useGuildConfig(guildAddress);
  const { data: token } = useERC20Info(data?.token);

  return (
    <Modal
      header={token ? `Stake ${token.name} tokens` : <Skeleton width={100} />}
      isOpen={isOpen}
      onDismiss={onDismiss}
      maxWidth={300}
    >
      <StakeTokens />
    </Modal>
  );
};

export default StakeTokensModal;
