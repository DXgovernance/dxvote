import useEtherSWR from 'ether-swr';

export const useProposals = (guildId: string) => {
  return useEtherSWR<string[]>([guildId, 'getProposalsIds']);
};
