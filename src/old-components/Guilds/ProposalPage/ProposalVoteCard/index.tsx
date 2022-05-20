import SidebarCard, {
  SidebarCardContent,
  SidebarCardHeaderSpaced,
} from '../../SidebarCard';
import { Button } from '../../common/Button';
import { VotesChart } from './VoteChart';
import { VoteConfirmationModal } from './VoteConfirmationModal';
import { VoteResults } from './VoteResults';
import { useWeb3React } from '@web3-react/core';
import { useTypedParams } from 'Modules/Guilds/Hooks/useTypedParams';
import { useTransactions } from 'contexts/Guilds';
import { BigNumber } from 'ethers';
import { useERC20Guild } from 'hooks/Guilds/contracts/useContract';
import { useProposal } from 'hooks/Guilds/ether-swr/guild/useProposal';
import useProposalMetadata from 'hooks/Guilds/ether-swr/guild/useProposalMetadata';
import useSnapshotId from 'hooks/Guilds/ether-swr/guild/useSnapshotId';
import { useVotingPowerOf } from 'hooks/Guilds/ether-swr/guild/useVotingPowerOf';
import { useVotingResults } from 'hooks/Guilds/ether-swr/guild/useVotingResults';
import useVotingPowerPercent from 'hooks/Guilds/guild/useVotingPowerPercent';
import useTimedRerender from 'hooks/Guilds/time/useTimedRerender';
import moment from 'moment';
import { Loading } from 'Components/Primitives/Loading';
import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import styled, { css, useTheme } from 'styled-components';

const ButtonsContainer = styled.div`
  flex-direction: column;
  display: flex;
  margin-top: 2.5rem;
`;

const SmallButton = styled(Button)`
  margin: 0px;
  padding: 0.1rem 0.4rem;
  width: 60px;
`;

export interface Voter {
  avatar: string;
}

const VotesContainer = styled.div`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.colors.text};
`;

const VoteOptionsLabel = styled.div`
  color: ${({ theme }) => theme.colors.proposalText.grey};
  margin-bottom: 0.5rem;
`;

const VoteActionButton = styled(Button)`
  height: 2.5rem;

  :disabled {
    background-color: transparent;
    border: 1px solid ${({ theme }) => theme.colors.border.initial};
    color: ${({ theme }) => theme.colors.proposalText.grey};
    opacity: 1;
  }
`;

const VoteOptionButton = styled(VoteActionButton)<{
  active?: boolean;
  selected?: boolean;
}>`
  margin-bottom: 1rem;
  background-color: ${({ theme }) => theme.colors.muted};

  :active {
    color: ${({ theme }) => theme.colors.background};
    background-color: ${({ theme }) => theme.colors.border.hover};
  }

  ${({ active, selected }) =>
    (active || selected) &&
    css`
      color: ${({ theme }) => theme.colors.background};
      background-color: ${({ theme }) => theme.colors.border.hover};
    `}
`;

const ProposalVoteCard = () => {
  const theme = useTheme();
  const [isPercent, setIsPercent] = useState(true);
  const [selectedAction, setSelectedAction] = useState<BigNumber>();
  const [modalOpen, setModalOpen] = useState<boolean>();

  const { guildId, proposalId } = useTypedParams();
  const { data: proposal } = useProposal(guildId, proposalId);
  const { data: proposalMetadata } = useProposalMetadata(guildId, proposalId);

  const voteData = useVotingResults();

  const timestamp = useTimedRerender(1000);

  const isOpen = useMemo(
    () => proposal?.endTime.isAfter(moment(timestamp)),
    [proposal, timestamp]
  );
  const { account: userAddress } = useWeb3React();
  const { data: userVotingPower } = useVotingPowerOf({
    contractAddress: guildId,
    userAddress,
  });
  const { createTransaction } = useTransactions();
  const contract = useERC20Guild(guildId, true);
  const { data: snapshotId } = useSnapshotId({
    contractAddress: guildId,
    proposalId,
  });

  // Get voting power without fallbackSnapshotId
  const { data: votingPower } = useVotingPowerOf({
    contractAddress: guildId,
    userAddress: userAddress,
    snapshotId: snapshotId?.toString(),
    fallbackSnapshotId: false,
  });

  // Get voting power at current snapshotId
  const { data: votingPowerAtProposalCurrentSnapshot } = useVotingPowerOf({
    contractAddress: guildId,
    userAddress: userAddress,
    snapshotId: null,
    fallbackSnapshotId: true,
  });

  const votingPowerPercent = useVotingPowerPercent(
    votingPower,
    voteData?.totalLocked
  );

  const currentLockedPercent = useVotingPowerPercent(
    voteData?.quorum,
    voteData?.totalLocked
  );

  const voteOnProposal = () => {
    const hasNoVotingPower =
      votingPower && Number(votingPower?.toString()) <= 0;

    const hasVotingPowerAtCurrentSnapshot =
      votingPowerAtProposalCurrentSnapshot &&
      Number(votingPowerAtProposalCurrentSnapshot?.toString()) > 0;
    if (hasNoVotingPower) {
      if (hasVotingPowerAtCurrentSnapshot) {
        return toastError(
          'Current voting power gained after proposal creation'
        );
      }
      return toastError('No Voting Power');
    }
    return setModalOpen(true);
  };

  const confirmVoteProposal = () => {
    createTransaction(`Vote on proposal ${proposal?.title}`, async () =>
      contract.setVote(proposalId, selectedAction, userVotingPower)
    );
  };

  const toastError = (msg: string) =>
    toast.error(msg, {
      style: {
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.muted,
      },
      autoClose: 2800,
      hideProgressBar: true,
    });

  return (
    <SidebarCard
      header={
        <SidebarCardHeaderSpaced>
          {!voteData ? (
            <Loading loading text />
          ) : isOpen ? (
            'Cast your vote'
          ) : (
            'Vote results'
          )}
          <SmallButton
            variant="secondary"
            onClick={() => setIsPercent(!isPercent)}
          >
            {!voteData ? (
              <Loading loading text skeletonProps={{ width: 40 }} />
            ) : isPercent ? (
              voteData?.token?.symbol
            ) : (
              '%'
            )}
          </SmallButton>
        </SidebarCardHeaderSpaced>
      }
    >
      <SidebarCardContent>
        <VotesContainer>
          <VoteResults isPercent={isPercent} />
          <VotesChart isPercent={isPercent} />
        </VotesContainer>

        {isOpen && voteData?.options && (
          <ButtonsContainer>
            <VoteOptionsLabel>Options</VoteOptionsLabel>

            {Object.keys(voteData?.options).map(optionKey => {
              const bItem = BigNumber.from(optionKey);

              return (
                <VoteOptionButton
                  variant="secondary"
                  active={selectedAction && selectedAction.eq(bItem)}
                  onClick={() => {
                    setSelectedAction(
                      selectedAction && selectedAction.eq(bItem) ? null : bItem
                    );
                  }}
                >
                  {proposalMetadata?.voteOptions?.[optionKey] ||
                    'Option ' + (optionKey + 1)}
                </VoteOptionButton>
              );
            })}

            <VoteActionButton
              disabled={!selectedAction}
              onClick={voteOnProposal}
            >
              Vote
            </VoteActionButton>
          </ButtonsContainer>
        )}
      </SidebarCardContent>
      <VoteConfirmationModal
        isOpen={modalOpen}
        onDismiss={() => setModalOpen(false)}
        onConfirm={confirmVoteProposal}
        selectedAction={
          proposalMetadata?.voteOptions?.[selectedAction?.toNumber()] ||
          selectedAction?.toString()
        }
        votingPower={votingPowerPercent}
        totalLocked={currentLockedPercent}
      />
    </SidebarCard>
  );
};

export default ProposalVoteCard;
