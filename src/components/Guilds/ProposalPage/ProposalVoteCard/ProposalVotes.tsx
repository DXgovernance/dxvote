import styled from 'styled-components';
import { VotesChart } from 'components/Guilds/common/VoteChart';
import Bullet from 'components/Guilds/common/Bullet';
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
  color: ${({ theme }) => theme.colors.text};
`;

const VotesRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  font-size: ${({ theme }) => theme.fontSizes.body};
  margin: 5px 0px 5px 0px;
`;

const SpacedBullet = styled(Bullet)`
  margin-right: 0.5rem;
  background-color: ${({ option, theme }) => theme.colors.votes?.[option]};
`;

const VoteOption = styled.div`
  display: flex;
  align-items: center;
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
  ): number =>
    showToken ? formatUnits(args[action][action][0]) : args[action][action][1];

  return (
    <VotesContainer>
      {voteData.args &&
        Object.values(voteData?.args).map((_, i) => {
          return (
            <VotesRow>
              <VoteOption>
                <SpacedBullet option={i} size={12} />
                <span>{'Action ' + i}</span>
              </VoteOption>
              <span>
                {valueToDisplay(i, showToken, voteData?.args)} {unitDisplay}
              </span>
            </VotesRow>
          );
        })}
      <VotesChart showToken={showToken} token={token} />
    </VotesContainer>
  );
};
