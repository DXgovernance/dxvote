import useEtherSWR from './useEtherSWR';

export const useProposals = (guildId: string) => {
  return useEtherSWR<string[]>([guildId, 'getProposalsIds']);
};
