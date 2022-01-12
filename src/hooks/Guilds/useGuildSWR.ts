import useEtherSWR from 'ether-swr';
import ERC20GuildContract from 'contracts/ERC20Guild.json';
import { useGuildAddress } from './useGuildAddress';

export const useGuildSWR = (data: any) => {
  const address = useGuildAddress();
  const GUILDS_CONFIG = {
    ABIs: new Map([[address, ERC20GuildContract.abi]]),
  };
  return useEtherSWR(data, GUILDS_CONFIG);
};
