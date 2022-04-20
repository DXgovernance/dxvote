import useEtherSWR from '../useEtherSWR';
import ERC20Guild from 'contracts/ERC20Guild.json';

const useGuildToken = (guildAddress: string) => {
  return useEtherSWR(guildAddress ? [guildAddress, 'getTotalMembers'] : [], {
    ABIs: new Map([[guildAddress, ERC20Guild.abi]]),
    refreshInterval: 0,
  });
};

export default useGuildToken;
