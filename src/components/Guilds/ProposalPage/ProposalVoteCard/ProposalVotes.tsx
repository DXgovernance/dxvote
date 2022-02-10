import styled from 'styled-components';
import { VotesChart } from 'components/Guilds/common/VoteChart';
import { Bullet } from 'components/Guilds/common/Bullet';
import { useVotes } from 'hooks/Guilds/useVotes';

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
  color: ${({ theme, type = 'yes' }) => theme.colors.votes[type].fg};
`;

const StyledBullet = styled(Bullet)`
  font-size: 30px;
`;

//TODO: create loading skeleton for vote component
export const ProposalVotes = ({ showToken, token }: ProposalVotesProps) => {
  const {
    voteData: { args },
  } = useVotes();
  const unitDisplay = showToken ? token : '%';

  const valueToDisplay = (showToken: boolean): number => (showToken ? 1 : 2);

  return (
    <VotesContainer>
      {Object.values(args).map((_, i) => {
        return (
          <VotesRow type="yes">
            <span>
              <StyledBullet />
              {'Action' + i}
            </span>
            <span>
              {valueToDisplay(showToken)}
              {unitDisplay}
            </span>
          </VotesRow>
        );
      })}
      <VotesChart showToken={showToken} token={token} />
    </VotesContainer>
  );
};
