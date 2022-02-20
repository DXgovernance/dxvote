import { useState, useEffect, useCallback } from 'react';
import { useProposal } from 'hooks/Guilds/ether-swr/guild/useProposal';
import { useParams } from 'react-router-dom';
import { useERC20Guild } from './contracts/useContract';
import { useVotingPowerOf } from './ether-swr/guild/useVotingPowerOf';
import { useWeb3React } from '@web3-react/core';
import { useTransactions } from 'contexts/Guilds';
import { useGuildConfig } from './ether-swr/guild/useGuildConfig';
import { ERC20Info, useERC20Info } from './ether-swr/erc20/useERC20Info';
import { BigNumber } from 'ethers';

export interface VoteData {
  args: unknown;
  quorum: BigNumber;
  totalLocked: BigNumber;
  token: ERC20Info;
}

interface useVotesReturns {
  setVote: (action: BigNumber) => void;
  voteData: VoteData;
}

export const useVotes = (): useVotesReturns => {
  const ZERO: BigNumber = BigNumber.from(0);
  const [voteData, setVoteData] = useState<VoteData>({
    args: {},
    quorum: ZERO,
    totalLocked: ZERO,
    token: {
      name: '',
      symbol: '',
      decimals: 0,
    },
  });

  const { guild_id: guildId, proposal_id: proposalId } =
    useParams<{ guild_id?: string; proposal_id?: string }>();

  const contract = useERC20Guild(guildId, true);
  const { account } = useWeb3React();
  const { createTransaction } = useTransactions();

  // swr hooks
  const { data: proposal } = useProposal(guildId, proposalId);
  const { data } = useGuildConfig(guildId);
  const { data: votingPower } = useVotingPowerOf({
    contractAddress: guildId,
    userAddress: account,
  });

  const { data: tokenInfo } = useERC20Info(data?.token);

  // helper functions
  const pValue = (value: BigNumber, precision: number = 2) => {
    const percent = value
      .mul(100)
      .mul(Math.pow(10, precision))
      .div(data?.totalLocked);
    return Math.round(percent.toNumber()) / Math.pow(10, precision);
  };

  // sets voting transaction
  const setVote = useCallback(
    (action: BigNumber) => {
      createTransaction('Set Vote', async () =>
        contract.setVote(proposalId, action, votingPower)
      );
    },
    [proposalId, votingPower]
  );

  useEffect(() => {
    const getVoteData = async () =>
      await setVoteData({
        args: proposal?.totalVotes.map((item, i) => {
          return { [i]: [item, pValue(item)] };
        }),
        quorum: data?.votingPowerForProposalExecution,
        totalLocked: data?.totalLocked,
        token: tokenInfo,
      });

    getVoteData();
  }, [guildId, proposalId, tokenInfo]);

  return {
    setVote,
    voteData,
  };
};
