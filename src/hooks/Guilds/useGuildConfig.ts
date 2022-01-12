import { useGuildSWR } from './useGuildSWR';

export const useGuildConfig = (address: string) => {
  const result = useGuildSWR([
    [address, 'getToken'],
    [address, 'getPermissionRegistry'],
    [address, 'getName'],
    [address, 'getProposalTime'],
    [address, 'getTimeForExecution'],
    [address, 'getMaxActiveProposals'],
  ]);
  const [
    token,
    permissionRegistry,
    name,
    proposalTime,
    timeForExecution,
    maxActiveProposals,
  ] = result.data;

  return {
    ...result,
    data: {
      token,
      permissionRegistry,
      name,
      proposalTime,
      timeForExecution,
      maxActiveProposals,
    },
  };
};
