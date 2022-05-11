import { Loading } from 'Components/Primitives/Loading';
import { getInfoLineView } from 'old-components/Guilds/ActionsBuilder/SupportedActions';
import UndecodableCallInfoLine from 'old-components/Guilds/ActionsBuilder/UndecodableCalls/UndecodableCallsInfoLine';
import { useTypedParams } from 'Modules/Guilds/Hooks/useTypedParams';
import useFilteredProposalActions from './useFilteredProposalActions';
import {
  ActionsWrapper,
  BorderedIconDetailWrapper,
  NotFoundActionWrapper,
} from 'components/ProposalCard/ProposalCard.styled';

interface ProposalCardActionSummaryProps {
  isLoading?: boolean;
}

const ProposalCardActionSummary: React.FC<ProposalCardActionSummaryProps> = ({
  isLoading,
}) => {
  const { guildId, proposalId } = useTypedParams();
  const actions = useFilteredProposalActions(guildId, proposalId);
  if (isLoading) {
    return (
      <Loading
        style={{ margin: 0 }}
        loading
        text
        skeletonProps={{ width: '200px' }}
      />
    );
  }
  return (
    <ActionsWrapper>
      {actions?.map(action => {
        if (!action) return null;
        const InfoLine = getInfoLineView(action?.decodedCall?.callType);

        return !!InfoLine ? (
          <BorderedIconDetailWrapper>
            <InfoLine
              decodedCall={action?.decodedCall}
              approveSpendTokens={action?.approval}
              compact
            />
          </BorderedIconDetailWrapper>
        ) : (
          <NotFoundActionWrapper>
            <UndecodableCallInfoLine />
          </NotFoundActionWrapper>
        );
      })}
    </ActionsWrapper>
  );
};

export default ProposalCardActionSummary;
