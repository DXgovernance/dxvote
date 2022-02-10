import { useState, useEffect } from 'react';
import { useProposal } from 'hooks/Guilds/ether-swr/useProposal';
import { BigNumber, bnum } from 'utils';
import { useParams } from 'react-router-dom';
import { useERC20Guild } from './contracts/useContract';
import { useVotingPowerOf } from './ether-swr/useVotingPowerOf';
import { useWeb3React } from '@web3-react/core';
import { useTransactions } from 'contexts/Guilds';
import { useVotingPowerForProposalExecution } from './ether-swr/useVotingPowerForProposalExecution';
import { useTotalLocked } from './ether-swr/useTotalLocked';
import { BigNumberish } from '@ethersproject/contracts/node_modules/@ethersproject/bignumber';

export interface VoteData {
  args: unknown;
  quorum: BigNumber;
  totalLocked: BigNumber;
}

interface useVotesReturns {
  setVote: (action: BigNumberish) => Promise<void>;
  voteData: VoteData;
  flagCheckered: number;
}

export const useVotes = (): useVotesReturns => {
  const [voteData, setVoteData] = useState<VoteData>({
    args: {},
    quorum: bnum(0),
    totalLocked: bnum(0),
  });

  const { guild_id: guildId, proposal_id: proposalId } =
    useParams<{ guild_id?: string; proposal_id?: string }>();
  const contract = useERC20Guild(guildId, true);
  const { account } = useWeb3React();
  const { createTransaction } = useTransactions();

  // swr hooks
  const { data: proposal } = useProposal(guildId, proposalId);
  const { data: totalLocked } = useTotalLocked({ contractAddress: guildId });
  const { data: quorum } = useVotingPowerForProposalExecution({
    contractAddress: guildId,
  });
  const { data: votingPower } = useVotingPowerOf({
    contractAddress: guildId,
    userAddress: account,
  });

  const [flagCheckered, setFlagCheckered] = useState(0);

  // helper functions
  const pValue = (value: BigNumber) =>
    Math.round(bnum(value).div(voteData.totalLocked).toNumber() * 100);

  const setVote = async (action: BigNumberish) => {
    createTransaction('Set Vote', async () =>
      contract.setVote(proposalId, action, votingPower.toString())
    );
  };

  useEffect(() => {
    if (!proposal) return null;

    setVoteData({
      //args:{ 1: { BigNumber, % value }}
      args: proposal.totalVotes.map((item, i) => {
        return { [i]: [item, pValue(item)] };
      }),
      quorum: quorum,
      totalLocked: totalLocked,
    });
    setFlagCheckered(
      voteData.quorum
        .div(bnum(100))
        .multipliedBy(voteData.totalLocked)
        .toNumber()
    );
  }, [contract, guildId, proposalId, votingPower, quorum, proposal]);

  return {
    setVote,
    voteData,
    flagCheckered,
  };
};
