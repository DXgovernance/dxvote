import { useERC20Info } from '../../../hooks/Guilds/ether-swr/erc20/useERC20Info';
import { useGuildConfig } from '../../../hooks/Guilds/ether-swr/guild/useGuildConfig';
import { Loading } from '../../../Components/Primitives/Loading';
import { Modal } from '../common/Modal';
import { StakeTokens } from './StakeTokens';
import { useTypedParams } from 'Modules/Guilds/Hooks/useTypedParams';

interface StakeTokensModalInterface {
  isOpen: boolean;
  onDismiss: () => void;
}

const StakeTokensModal: React.FC<StakeTokensModalInterface> = ({
  isOpen,
  onDismiss,
}) => {
  const { guildId: guildAddress } = useTypedParams();
  const { data } = useGuildConfig(guildAddress);
  const { data: token } = useERC20Info(data?.token);

  return (
    <Modal
      header={
        token ? (
          `Stake ${token.name} tokens`
        ) : (
          <Loading loading text skeletonProps={{ width: '100px' }} />
        )
      }
      isOpen={isOpen}
      onDismiss={onDismiss}
      maxWidth={300}
    >
      <StakeTokens />
    </Modal>
  );
};

export default StakeTokensModal;
