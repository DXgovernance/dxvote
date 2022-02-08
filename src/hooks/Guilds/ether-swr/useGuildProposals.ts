import useEtherSWR from './useEtherSWR';

export const useGuildProposals = (guildId: string) =>
  useEtherSWR([guildId, 'getProposalsIds']);
