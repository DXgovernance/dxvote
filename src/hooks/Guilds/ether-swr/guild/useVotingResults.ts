import { useMemo } from 'react';
import { useProposal } from 'hooks/Guilds/ether-swr/guild/useProposal';
import { useParams } from 'react-router-dom';
import { BigNumber } from 'ethers';
import { ERC20Info, useERC20Info } from '../erc20/useERC20Info';
import { useGuildConfig } from './useGuildConfig';

export interface VoteData {
  options: { [name: string]: BigNumber };
  quorum: BigNumber;
  totalLocked: BigNumber;
  token: ERC20Info;
}

export const useVotingResults = (): VoteData => {
  const { guild_id: guildId, proposal_id: proposalId } =
    useParams<{ guild_id?: string; proposal_id?: string }>();

  // swr hooks
  const { data: proposal } = useProposal(guildId, proposalId);
  const { data } = useGuildConfig(guildId);
  const { data: tokenInfo } = useERC20Info(data?.token);

  const voteData = useMemo(() => {
    if (!proposal || !data || !tokenInfo) return undefined;

    const options = proposal?.totalVotes
      .slice(1)
      .reduce<Record<string, BigNumber>>((acc, result, i) => {
        acc[i] = result;
        return acc;
      }, {});

    return {
      options,
      quorum: data?.votingPowerForProposalExecution,
      totalLocked: data?.totalLocked,
      token: tokenInfo,
    };
  }, [data, proposal, tokenInfo]);

  return voteData;
};
