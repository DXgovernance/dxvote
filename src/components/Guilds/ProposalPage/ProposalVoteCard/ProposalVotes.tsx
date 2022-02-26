import styled from 'styled-components';
import { VotesChart } from 'components/Guilds/common/VoteChart';
import { useVotes } from 'hooks/Guilds/useVotes';
import { formatUnits } from '@ethersproject/units';
import { Flex } from 'components/Guilds/common/Layout';

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
  color: ${({ theme }) => theme.colors.text};
`;

const ColoredBullet = styled.span`
  color: ${({ type, theme }) => theme.colors.votes[type].bg};
  font-size: 1.5rem;
  margin, padding: 0;
  position: absolute;

`;
const StyledContainer = styled(Flex)`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;
const StyledText = styled.span`
  margin-left: 1.2rem;
`;

export const ProposalVotes: React.FC<ProposalVotesProps> = ({
  showToken,
  token,
}) => {
  const { voteData } = useVotes();
  const unitDisplay = showToken ? token : '%';

  const valueToDisplay = (
    action: number,
    showToken: boolean,
    args: any
  ): number => {
    if (args[action] === null || args[action] === undefined) {
      return 0;
    }
    return showToken
      ? formatUnits(args[action][action][0])
      : args[action][action][1];
  };

  return (
    <VotesContainer>
      {voteData.args &&
        Object.values(voteData?.args).map((_, i) => {
          return (
            <>
              <VotesRow key={i}>
                <StyledContainer>
                  <ColoredBullet type="for">{'\u2022'}</ColoredBullet>
                  <StyledText>{'For'}</StyledText>
                </StyledContainer>
                <div>
                  {valueToDisplay(i, showToken, voteData?.args)} {unitDisplay}
                </div>
              </VotesRow>
              <VotesRow>
                <StyledContainer>
                  <ColoredBullet type="against">{'\u2022'}</ColoredBullet>
                  <StyledText>{'Against'}</StyledText>
                </StyledContainer>
                <div>
                  {valueToDisplay(i + 1, showToken, voteData?.args)}{' '}
                  {unitDisplay}
                </div>
              </VotesRow>
            </>
          );
        })}
      <VotesChart showToken={showToken} token={token} />
    </VotesContainer>
  );
};
