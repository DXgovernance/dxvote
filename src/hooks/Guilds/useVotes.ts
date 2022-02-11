import { useState, useEffect, useCallback } from 'react';
import { useProposal } from 'hooks/Guilds/ether-swr/useProposal';
import { BigNumber, bnum } from 'utils';
import { useParams } from 'react-router-dom';
import { useERC20Guild } from './contracts/useContract';
import { useVotingPowerOf } from './ether-swr/useVotingPowerOf';
import { useWeb3React } from '@web3-react/core';
import { useTransactions } from 'contexts/Guilds';
import { BigNumberish } from '@ethersproject/contracts/node_modules/@ethersproject/bignumber';
import { useGuildConfig } from './ether-swr/useGuildConfig';

export interface VoteData {
  args: unknown;
  quorum: BigNumber;
  totalLocked: BigNumber;
}

interface useVotesReturns {
  setVote: (action: BigNumberish) => void;
  voteData: VoteData;
  flagCheckered: number;
}

export const useVotes = (): useVotesReturns => {
  const [flagCheckered, setFlagCheckered] = useState(0);
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
  const {
    data: { votingPowerForProposalExecution: quorum, totalLocked },
  } = useGuildConfig(guildId);
  const { data: votingPower } = useVotingPowerOf({
    contractAddress: guildId,
    userAddress: account,
  });

  // helper functions
  const pValue = (value: BigNumber) =>
    Math.round(bnum(value).div(voteData.totalLocked).toNumber() * 100);

  // sets voting transaction
  const setVote = useCallback(
    (action: BigNumberish) => {
      createTransaction('Set Vote', async () =>
        contract.setVote(proposalId, action, votingPower.toString())
      );
    },
    [proposalId, votingPower]
  );

  useEffect(() => {
    const getVoteData = async () =>
      await setVoteData({
        //args:{ 1: { BigNumber, % value }}
        args: proposal.totalVotes.map((item, i) => {
          return { [i]: [item, pValue(item)] };
        }),
        quorum: bnum(quorum),
        totalLocked: bnum(totalLocked),
      });

    getVoteData();

    const getFlag = async () =>
      await setFlagCheckered(
        voteData.quorum.div(bnum(100)).multipliedBy(voteData.quorum).toNumber()
      );

    getFlag();
  }, [guildId, proposalId]);

  return {
    setVote,
    voteData,
    flagCheckered,
  };
};
