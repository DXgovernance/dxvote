import { useState, useEffect, useCallback } from 'react';
import { useProposal } from 'hooks/Guilds/ether-swr/useProposal';
import { BigNumber, bnum } from 'utils';
import { useParams } from 'react-router-dom';
import { useERC20Guild } from './contracts/useContract';
import { useVotingPowerOf } from './ether-swr/useVotingPowerOf';
import { useWeb3React } from '@web3-react/core';
import { useTransactions } from 'contexts/Guilds';
import { useGuildConfig } from './ether-swr/useGuildConfig';
import { useERC20Info } from './ether-swr/erc20/useERC20Info';

export interface VoteData {
  args: unknown;
  quorum: BigNumber;
  totalLocked: BigNumber;
  token: string;
}

interface useVotesReturns {
  setVote: (action: BigNumber) => void;
  voteData: VoteData;
  flagCheckered: number;
}

export const useVotes = (): useVotesReturns => {
  const [voteData, setVoteData] = useState<VoteData>({
    args: {},
    quorum: bnum(0),
    totalLocked: bnum(0),
    token: '',
  });

  const { guild_id: guildId, proposal_id: proposalId } =
    useParams<{ guild_id?: string; proposal_id?: string }>();

  const contract = useERC20Guild(guildId, true);
  const { account } = useWeb3React();
  const { createTransaction } = useTransactions();

  // swr hooks
  const { data: proposal } = useProposal(guildId, proposalId);
  const {
    data: { token, votingPowerForProposalExecution: quorum, totalLocked },
  } = useGuildConfig(guildId);
  const { data: votingPower } = useVotingPowerOf({
    contractAddress: guildId,
    userAddress: account,
  });

  const { data: tokenInfo } = useERC20Info(token);

  // helper functions
  const pValue = (value: BigNumber) =>
    Math.round(bnum(value).div(bnum(totalLocked)).toNumber() * 100);

  // sets voting transaction
  const setVote = useCallback(
    (action: BigNumber) => {
      createTransaction('Set Vote', async () =>
        contract.setVote(proposalId, action.toString(), votingPower.toString())
      );
    },
    [proposalId, votingPower]
  );

  const flagCheckered = quorum.div(totalLocked).toNumber() * 100;

  useEffect(() => {
    const getVoteData = async () =>
      await setVoteData({
        //args:{ 1: { BigNumber, % value }}
        args: proposal.totalVotes.map((item, i) => {
          return { [i]: [item, pValue(item)] };
        }),
        quorum: bnum(quorum),
        totalLocked: bnum(totalLocked),
        token: tokenInfo.symbol,
      });

    getVoteData();
  }, [guildId, proposalId]);

  return {
    setVote,
    voteData,
    flagCheckered,
  };
};
