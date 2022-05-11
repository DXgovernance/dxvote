import { ERC20Info, useERC20Info } from '../erc20/useERC20Info';
import { useGuildConfig } from './useGuildConfig';
import { useTypedParams } from 'Modules/Guilds/Hooks/useTypedParams';
import { BigNumber } from 'ethers';
import { useProposal } from 'hooks/Guilds/ether-swr/guild/useProposal';
import { useMemo } from 'react';

export interface VoteData {
  options: { [name: string]: BigNumber };
  quorum: BigNumber;
  totalLocked: BigNumber;
  token: ERC20Info;
}

export const useVotingResults = (
  optionalGuildId?: string,
  optionalProposalId?: string
): VoteData => {
  const { guildId, proposalId } = useTypedParams();

  // swr hooks
  const { data: proposal } = useProposal(
    optionalGuildId || guildId,
    optionalProposalId || proposalId
  );
  const { data } = useGuildConfig(optionalGuildId || guildId);
  const { data: tokenInfo } = useERC20Info(data?.token);

  const voteData = useMemo(() => {
    if (!proposal || !data || !tokenInfo) return undefined;
    const options = proposal?.totalVotes
      .slice(0, proposal?.totalVotes?.length - 1) // TODO: it was removing the first, but need to remove the last. investigate sure why?.
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
