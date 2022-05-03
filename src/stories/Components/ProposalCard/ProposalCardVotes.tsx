import styled from 'styled-components';
import { FiCircle } from 'react-icons/fi';

import { Box } from 'components/Guilds/common/Layout';
import { Loading } from 'components/Guilds/common/Loading';

interface ProposalCardVotesProps {
  isLoading?: boolean;
  votes?: number[];
}

const IconDetailWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const BorderedIconDetailWrapper = styled(IconDetailWrapper)`
  border: 1px solid ${({ theme }) => theme.colors.border.initial};
  border-radius: 1rem;
  padding: 0.25rem 0.8rem;
  flex: none;
  display: flex;
`;

const Detail = styled(Box)`
  font-size: 0.95rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const Icon = styled.img<{
  spaceLeft?: boolean;
  spaceRight?: boolean;
  bordered: boolean;
}>`
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;

  ${props => props.spaceLeft && `margin-left: 0.5rem;`}
  ${props => props.spaceRight && `margin-right: 0.5rem;`}

  ${props =>
    props.bordered &&
    `
    border: 1px solid #000;
    border-radius: 50%;
  `}
`;

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
