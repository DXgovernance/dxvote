import styled from 'styled-components';

import { VotesChart } from 'components/Guilds/common/VoteChart';
import { Bullet } from 'components/Guilds/common/Bullet';

export interface Voter {
  avatar: string;
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

export const ProposalVotes = ({ voteData, showToken, token }) => {
  const { yes, no, totalLocked } = voteData;

  const valueToDisplay = value =>
    showToken ? value : Math.round((value / totalLocked) * 100);
  const yesDisplay = valueToDisplay(yes);
  const noDisplay = valueToDisplay(no);

  const unitDisplay = showToken ? token : '%';

  return (
    <VotesContainer>
      {yes && (
        <VotesRow type="yes">
          <span>
            <StyledBullet />
            Yes
          </span>
          <span>
            {yesDisplay}
            {unitDisplay}
          </span>
        </VotesRow>
      )}
      {no && (
        <VotesRow type="no">
          <span>
            <StyledBullet />
            No
          </span>
          <span>
            {noDisplay}
            {unitDisplay}
          </span>
        </VotesRow>
      )}

      <VotesChart voteData={voteData} showToken={showToken} token={token} />
    </VotesContainer>
  );
};
