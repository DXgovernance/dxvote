import { Loading } from 'Components/Primitives/Loading';
import { getInfoLineView } from 'old-components/Guilds/ActionsBuilder/SupportedActions';
import UndecodableCallInfoLine from 'old-components/Guilds/ActionsBuilder/UndecodableCalls/UndecodableCallsInfoLine';
import {
  ActionsWrapper,
  BorderedIconDetailWrapper,
  NotFoundActionWrapper,
} from 'Components/ProposalCard/ProposalCard.styled';

interface ProposalCardActionSummaryProps {
  actions?: any[];
}

const ProposalCardActionSummary: React.FC<ProposalCardActionSummaryProps> = ({
  actions,
}) => {
  const isLoading = !actions;
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
