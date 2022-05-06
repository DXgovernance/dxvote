import { useTypedParams } from '../Hooks/useTypedParams';
import ProposalCard from 'Components/ProposalCard/ProposalCard';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { useProposal } from 'hooks/Guilds/ether-swr/guild/useProposal';
import useVoteSummary from 'hooks/Guilds/useVoteSummary';
import { MAINNET_ID } from 'utils/constants';

interface ProposalCardWrapperProps {
  id?: string;
  href?: string;
}
const ProposalCardWrapper: React.FC<ProposalCardWrapperProps> = ({
  id,
  href,
}) => {
  const { guildId } = useTypedParams();
  const { data: proposal } = useProposal(guildId, id);
  const votes = useVoteSummary(guildId, id);
  const ensAvatar = useENSAvatar(proposal?.creator, MAINNET_ID);
  return (
    <ProposalCard
      proposal={proposal}
      ensAvatar={ensAvatar}
      votes={votes}
      href={href}
    />
  );
};

export default ProposalCardWrapper;
