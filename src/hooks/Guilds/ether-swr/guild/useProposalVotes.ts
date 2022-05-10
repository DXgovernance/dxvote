import { Proposal } from '../../../../types/types.guilds';
import useEtherSWR from '../useEtherSWR';
import ERC20GuildContract from 'contracts/ERC20Guild.json';

export const useProposal = (guildId: string, proposalId: string) => {
  return useEtherSWR<Proposal>(
    guildId && proposalId ? [guildId, 'proposalVotes', proposalId] : [],
    {
      ABIs: new Map([[guildId, ERC20GuildContract.abi]]),
    }
  );
};
