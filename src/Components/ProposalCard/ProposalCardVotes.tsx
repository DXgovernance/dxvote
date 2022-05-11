import { Fragment } from 'react';
import { FiCircle } from 'react-icons/fi';
import { Loading } from 'Components/Primitives/Loading';
import {
  Detail,
  BorderedIconDetailWrapper,
  Icon,
  VoteInfoWrapper,
} from 'components/ProposalCard/ProposalCard.styled';

interface ProposalCardVotesProps {
  isLoading?: boolean;
  votes?: number[];
}

const ProposalCardVotes: React.FC<ProposalCardVotesProps> = ({
  isLoading,
  votes,
}) => {
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
    <VoteInfoWrapper>
      <BorderedIconDetailWrapper>
        {votes
          .sort((a, b) => b - a)
          .map((vote, i) => {
            if (i < 3 && !(i === votes.length - 1)) {
              return (
                <Fragment>
                  <Detail>{vote}%</Detail>
                  <Icon as="div" spaceLeft spaceRight>
                    <FiCircle />
                  </Icon>
                </Fragment>
              );
            } else {
              return <Detail>{vote}%</Detail>;
            }
          })}
      </BorderedIconDetailWrapper>
    </VoteInfoWrapper>
  );
};

export default ProposalCardVotes;
