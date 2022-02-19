import useEtherSWR from './useEtherSWR';

export const useGuildProposalIds = (guildId: string) =>
  useEtherSWR<string[]>([guildId, 'getProposalsIds']);
