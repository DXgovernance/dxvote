import styled, { useTheme } from 'styled-components';
import Bullet from 'components/Guilds/common/Bullet';
import { useVotingResults } from 'hooks/Guilds/ether-swr/guild/useVotingResults';
import useVotingPowerPercent from 'hooks/Guilds/guild/useVotingPowerPercent';
import { Loading } from 'components/Guilds/common/Loading';
import { formatUnits } from 'ethers/lib/utils';
import useProposalMetadata from 'hooks/Guilds/ether-swr/guild/useProposalMetadata';
import { useTypedParams } from 'stories/Modules/Guilds/Hooks/useTypedParams';

const VotesRowWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  font-size: ${({ theme }) => theme.fontSizes.body};
  margin: 5px 0px 5px 0px;
`;

const VoteOption = styled.div`
  display: flex;
  align-items: center;
`;

const OptionBullet = styled.span`
  margin-right: 0.5rem;
`;

interface ResultRowProps {
  isPercent: boolean;
  optionKey?: number;
}

export const VoteResultRow: React.FC<ResultRowProps> = ({
  isPercent,
  optionKey,
}) => {
  const { guildId, proposalId } = useTypedParams();

  const isReady = optionKey !== undefined;

  const votingResults = useVotingResults();
  const votingPowerPercent = useVotingPowerPercent(
    votingResults?.options?.[optionKey],
    votingResults?.totalLocked,
    2
  );
  const theme = useTheme();
  const { data: proposalMetadata } = useProposalMetadata(guildId, proposalId);

  return (
    <VotesRowWrapper>
      <VoteOption>
        <OptionBullet>
          {isReady ? (
            <Bullet color={theme?.colors?.votes?.[optionKey]} size={8} />
          ) : (
            <Loading
              loading
              text
              skeletonProps={{ circle: true, height: 16, width: 16 }}
            />
          )}
        </OptionBullet>

        {isReady ? (
          proposalMetadata?.voteOptions?.[optionKey] ||
          'Option ' + (optionKey + 1)
        ) : (
          <Loading loading text />
        )}
      </VoteOption>
      {isReady && votingResults ? (
        <span>
          {isPercent
            ? `${formatUnits(votingResults?.options?.[optionKey] || 0)} ${
                votingResults?.token?.symbol
              }`
            : `${votingPowerPercent}%`}
        </span>
      ) : (
        <Loading loading text skeletonProps={{ width: 50 }} />
      )}
    </VotesRowWrapper>
  );
};

export const VoteResults: React.FC<{
  isPercent: boolean;
}> = ({ isPercent }) => {
  const votingResults = useVotingResults();

  return votingResults ? (
    <>
      {Object.entries(votingResults.options).map((_, i) => (
        <VoteResultRow optionKey={i} isPercent={isPercent} />
      ))}
    </>
  ) : (
    <>
      <VoteResultRow isPercent={isPercent} />
      <VoteResultRow isPercent={isPercent} />
    </>
  );
};
