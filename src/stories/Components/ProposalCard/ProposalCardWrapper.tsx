import { useParams } from 'react-router';

import { useProposal } from 'hooks/Guilds/ether-swr/guild/useProposal';
import useENSAvatar from '../../../hooks/Guilds/ether-swr/ens/useENSAvatar';
import { MAINNET_ID } from '../../../utils/constants';
import useVoteSummary from 'hooks/Guilds/useVoteSummary';

interface ProposalCardVotesProps {
  isLoading?: boolean;
}

const BorderedIconDetailWrapper = styled(IconDetailWrapper)`
  border: 1px solid ${({ theme }) => theme.colors.border.initial};
  border-radius: 1rem;
  padding: 0.25rem 0.8rem;
  flex: none;
  display: flex;
`;

const ProposalCardVotes = ({ isLoading }) => {
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
    <BorderedIconDetailWrapper>
      {votes
        .sort((a, b) => b - a)
        .map((vote, i) => {
          if (i < 3 && !(i === votes.length - 1)) {
            return (
              <>
                <Detail>{vote}%</Detail>
                <Icon as="div" spaceLeft spaceRight>
                  <FiCircle />
                </Icon>
              </>
            );
          } else {
            return <Detail>{vote}%</Detail>;
          }
        })}
    </BorderedIconDetailWrapper>
  );
};

export default ProposalCardVotes;
