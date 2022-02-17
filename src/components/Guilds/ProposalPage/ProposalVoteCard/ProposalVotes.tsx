import styled from 'styled-components';
import { VotesChart } from 'components/Guilds/common/VoteChart';
import { Bullet } from 'components/Guilds/common/Bullet';
import { useVotes } from 'hooks/Guilds/useVotes';
import { formatUnits } from '@ethersproject/units';

export interface Voter {
  avatar: string;
}

interface ProposalVotesProps {
  showToken: boolean;
  token: string;
}

const VotesContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const VotesRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
  margin: 5px 0px 5px 0px;
  color: ${({ theme, type = '0' }) => theme.colors.votes[type].fg};
`;

const StyledBullet = styled(Bullet)`
  font-size: 30px;
`;

export const ProposalVotes: React.FC<ProposalVotesProps> = ({
  showToken,
  token,
}) => {
  const {
    voteData: { args },
  } = useVotes();
  const unitDisplay = showToken ? token : '%';

  const valueToDisplay = (
    action: number,
    showToken: boolean,
    args: any
  ): number =>
    showToken ? formatUnits(args[action][action][0]) : args[action][action][1];

  return (
    <VotesContainer>
      {Object.values(args).map((_, i) => {
        return (
          <VotesRow type={i}>
            <span>
              <StyledBullet />
              {'Action ' + i}
            </span>
            <span>
              {valueToDisplay(i, showToken, args)} {unitDisplay}
            </span>
          </VotesRow>
        );
      })}
      <VotesChart showToken={showToken} token={token} />
    </VotesContainer>
  );
};
