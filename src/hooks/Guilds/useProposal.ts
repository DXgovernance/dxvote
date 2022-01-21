import useEtherSWR from 'ether-swr';

export const useProposal = (guildId, proposalId) => {
  return useEtherSWR([guildId, 'getProposal', proposalId]);
};
