import { useTypedParams } from '../Hooks/useTypedParams';
import ProposalCard from 'Components/ProposalCard/ProposalCard';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { useProposal } from 'hooks/Guilds/ether-swr/guild/useProposal';
import useVoteSummary from 'hooks/Guilds/useVoteSummary';
import { MAINNET_ID } from 'utils/constants';
import { useMemo } from 'react';
import { ProposalState } from 'Components/Types';
import moment from 'moment';

interface ProposalCardWrapperProps {
  proposalId?: string;
}
const ProposalCardWrapper: React.FC<ProposalCardWrapperProps> = ({
  proposalId,
}) => {
  const { guildId, chainName } = useTypedParams();
  const { data: proposal } = useProposal(guildId, proposalId);
  const votes = useVoteSummary(guildId, proposalId);

  const ensAvatar = useENSAvatar(proposal?.creator, MAINNET_ID);

  // Make into hooks
  const timeDetail = useMemo(() => {
    if (!proposal?.endTime) return null;

    const currentTime = moment();
    if (proposal.endTime?.isBefore(currentTime)) {
      return proposal.endTime.fromNow();
    } else {
      return proposal.endTime.toNow();
    }
  }, [proposal]);

  // Make into singular guild state hook
  const status = useMemo(() => {
    if (!proposal?.endTime) return null;
    switch (proposal.state) {
      case ProposalState.Active:
        const currentTime = moment();
        if (currentTime.isSameOrAfter(proposal.endTime)) {
          return ProposalState.Failed;
        } else {
          return ProposalState.Active;
        }
      case ProposalState.Executed:
        return ProposalState.Executed;
      case ProposalState.Passed:
        return ProposalState.Passed;
      case ProposalState.Failed:
        return ProposalState.Failed;
      default:
        return proposal.state;
    }
  }, [proposal]);

  return (
    <ProposalCard
      proposal={{ ...proposal, id: proposalId }}
      ensAvatar={ensAvatar}
      votes={votes}
      href={`/${chainName}/${guildId}/proposal/${proposalId}`}
      statusProps={{ timeDetail, status, endTime: proposal?.endTime }}
    />
  );
};

export default ProposalCardWrapper;
