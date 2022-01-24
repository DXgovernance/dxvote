import useEtherSWR from 'ether-swr';

export const useProposal = (guildId, proposalId) => {
  //we need middleware to calculate endTime
  //we could add a function here meanwhile
  return useEtherSWR([guildId, 'getProposal', proposalId]);
};
