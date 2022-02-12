import { useState, useEffect, useCallback } from 'react';
import { useProposal } from 'hooks/Guilds/ether-swr/useProposal';
import { BigNumber, bnum } from 'utils';
import { useParams } from 'react-router-dom';
import { useERC20, useERC20Guild } from './contracts/useContract';
import { useVotingPowerOf } from './ether-swr/useVotingPowerOf';
import { useWeb3React } from '@web3-react/core';
import { useTransactions } from 'contexts/Guilds';
import { useGuildConfig } from './ether-swr/useGuildConfig';

export interface VoteData {
  args: unknown;
  quorum: BigNumber;
  totalLocked: BigNumber;
  token: string,
}

interface useVotesReturns {
  setVote: (action: BigNumber) => void;
  voteData: VoteData;
  flagCheckered: number;
}

export const useVotes = (): useVotesReturns => {
  const [flagCheckered, setFlagCheckered] = useState<number>();
  const [voteData, setVoteData] = useState<VoteData>({
    args: {},
    quorum: bnum(0),
    totalLocked: bnum(0),
    token: ''
  });

  const { guild_id: guildId, proposal_id: proposalId } =
    useParams<{ guild_id?: string; proposal_id?: string }>();
  const contract = useERC20Guild(guildId, true);
  const erc20 = useERC20(contract.getToken());
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
    (action: BigNumber) => {
      createTransaction('Set Vote', async () =>
        contract.setVote(proposalId, action.toString(), votingPower.toString())
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
        token: erc20.address
      });

    getVoteData();

    const getFlag = () =>
      setFlagCheckered(
        voteData.quorum.div(voteData.totalLocked).multipliedBy(bnum(100)).toNumber()
      );

    getFlag();
  }, [guildId, proposalId]);

  return {
    setVote,
    voteData,
    flagCheckered,
  };
};
