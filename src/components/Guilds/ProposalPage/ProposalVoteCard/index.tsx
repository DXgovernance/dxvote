import { BigNumber } from 'ethers';
import { useProposal } from 'hooks/Guilds/ether-swr/guild/useProposal';
import { useState, useMemo } from 'react';
import { useParams } from 'react-router';
import styled, { css } from 'styled-components';
import { Button } from '../../common/Button';
import moment from 'moment';
import SidebarCard, {
  SidebarCardContent,
  SidebarCardHeaderSpaced,
} from '../../SidebarCard';
import useTimedRerender from 'hooks/Guilds/time/useTimedRerender';
import { useVotingResults } from 'hooks/Guilds/ether-swr/guild/useVotingResults';
import { Loading } from 'components/Guilds/common/Loading';
import { VoteResults } from './VoteResults';
import { VotesChart } from './VoteChart';
import { useVotingPowerOf } from 'hooks/Guilds/ether-swr/guild/useVotingPowerOf';
import { useWeb3React } from '@web3-react/core';
import { useTransactions } from 'contexts/Guilds';
import { useERC20Guild } from 'hooks/Guilds/contracts/useContract';
import { VoteConfirmationModal } from './VoteConfirmationModal';

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

const VoteOptionButton = styled(VoteActionButton)`
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
  const [isPercent, setIsPercent] = useState(true);
  const [selectedAction, setSelectedAction] = useState<BigNumber>();
  const [modalOpen, setModalOpen] = useState<boolean>();

  const { guild_id: guildId, proposal_id: proposalId } =
    useParams<{ guild_id?: string; proposal_id?: string }>();
  const { data: proposal } = useProposal(guildId, proposalId);
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
  const voteOnProposal = async () => {
    setModalOpen(true);
  };

  const confirmVoteProposal = () => {
    createTransaction(`Vote on proposal ${proposal?.title}`, async () =>
      contract.setVote(proposalId, selectedAction, userVotingPower)
    );
  };
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

            {Object.keys(voteData?.options).map(actionKey => {
              const bItem = BigNumber.from(actionKey);

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
                  {'Action ' + actionKey}
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
        selectedAction="Yes"
        votingPower="0.12"
        previousVotingPercentage="0"
      />
    </SidebarCard>
  );
};

export default ProposalVoteCard;
