import useEtherSWR from '../useEtherSWR';
import ERC20Guild from 'contracts/ERC20Guild.json';

const useActiveProposalsNow = (guildAddress: string) => {
  return useEtherSWR(
    guildAddress ? [guildAddress, 'getActiveProposalsNow'] : [],
    {
      ABIs: new Map([[guildAddress, ERC20Guild.abi]]),
      refreshInterval: 0,
    }
  );
};

export default useActiveProposalsNow;
