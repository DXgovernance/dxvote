import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { SWRResponse } from 'swr';
import ERC20GuildContract from 'contracts/ERC20Guild.json';
import useEtherSWR from '../useEtherSWR';
import useTotalLocked from './useTotalLocked';
import useGuildToken from './useGuildToken';

type GuildConfig = {
  name: string;
  token: string;
  permissionRegistry: string;
  proposalTime: BigNumber;
  timeForExecution: BigNumber;
  maxActiveProposals: BigNumber;
  votingPowerForProposalCreation: BigNumber;
  votingPowerForProposalExecution: BigNumber;
  tokenVault: string;
  lockTime: BigNumber;
  totalLocked: BigNumber;
};

export const useGuildConfig = (
  guildAddress: string
): SWRResponse<GuildConfig> => {
  const { data, error, isValidating, mutate } = useEtherSWR(
    guildAddress
      ? [
          [guildAddress, 'getPermissionRegistry'], // Get the address of the permission registry contract
          [guildAddress, 'getName'], // Get the name of the ERC20Guild
          [guildAddress, 'getProposalTime'], // Get the proposalTime (seconds)
          [guildAddress, 'getTimeForExecution'], // Get the timeForExecution (seconds)
          [guildAddress, 'getMaxActiveProposals'], // Get the maxActiveProposals
          [guildAddress, 'getVotingPowerForProposalCreation'],
          [guildAddress, 'getVotingPowerForProposalExecution'],
          [guildAddress, 'getTokenVault'],
          [guildAddress, 'getLockTime'],
        ]
      : [],
    {
      ABIs: new Map([[guildAddress, ERC20GuildContract.abi]]),
      refreshInterval: 0,
    }
  );
  const { data: token } = useGuildToken(guildAddress);
  const { data: totalLocked } = useTotalLocked(guildAddress);

  // TODO: Move this into a SWR middleware
  const transformedData = useMemo(() => {
    if (!data) return undefined;

    const [
      permissionRegistry,
      name,
      proposalTime,
      timeForExecution,
      maxActiveProposals,
      votingPowerForProposalCreation,
      votingPowerForProposalExecution,
      tokenVault,
      lockTime,
    ] = data;

    return {
      permissionRegistry,
      name,
      proposalTime: BigNumber.from(proposalTime),
      timeForExecution: BigNumber.from(timeForExecution),
      maxActiveProposals: BigNumber.from(maxActiveProposals),
      votingPowerForProposalCreation: BigNumber.from(
        votingPowerForProposalCreation
      ),
      votingPowerForProposalExecution: BigNumber.from(
        votingPowerForProposalExecution
      ),
      tokenVault,
      lockTime: BigNumber.from(lockTime),
    };
  }, [data]);

  return {
    error,
    isValidating,
    mutate,
    data: transformedData
      ? { ...transformedData, totalLocked, token }
      : undefined,
  };
};
