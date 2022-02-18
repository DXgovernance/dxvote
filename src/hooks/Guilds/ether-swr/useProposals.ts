import useEtherSWR from './useEtherSWR';
import ERC20GuildContract from 'contracts/ERC20Guild.json';

export const useProposals = (guildId: string) => {
  return useEtherSWR<string[]>([guildId, 'getProposalsIds'], {
    ABIs: new Map([[guildId, ERC20GuildContract.abi]]),
  });
};
