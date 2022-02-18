import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import ERC20GuildContract from 'contracts/ERC20Guild.json';
import useEtherSWR from '../useEtherSWR';

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

export const useGuildConfig = (guildAddress: string) => {
  const { data, error, isValidating, mutate } = useEtherSWR(
    guildAddress
      ? [
          [guildAddress, 'getToken'], // Get the address of the ERC20Token used for voting
          [guildAddress, 'getPermissionRegistry'], // Get the address of the permission registry contract
          [guildAddress, 'getName'], // Get the name of the ERC20Guild
          [guildAddress, 'getProposalTime'], // Get the proposalTime (seconds)
          [guildAddress, 'getTimeForExecution'], // Get the timeForExecution (seconds)
          [guildAddress, 'getMaxActiveProposals'], // Get the maxActiveProposals
          [guildAddress, 'getVotingPowerForProposalCreation'],
          [guildAddress, 'getVotingPowerForProposalExecution'],
          [guildAddress, 'getTokenVault'],
          [guildAddress, 'getLockTime'],
          [guildAddress, 'getTotalLocked'],
        ]
      : [],
    {
      ABIs: new Map([[guildAddress, ERC20GuildContract.abi]]),
      refreshInterval: 0,
    }
  );

  // TODO: Move this into a SWR middleware
  const transformedData: GuildConfig = useMemo(() => {
    if (!data) return undefined;

    const [
      token,
      permissionRegistry,
      name,
      proposalTime,
      timeForExecution,
      maxActiveProposals,
      votingPowerForProposalCreation,
      votingPowerForProposalExecution,
      tokenVault,
      lockTime,
      totalLocked,
    ] = data;

    return {
      token,
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
      totalLocked: BigNumber.from(totalLocked),
    };
  }, [data]);

  return {
    error,
    isValidating,
    mutate,
    data: transformedData,
  };
};
