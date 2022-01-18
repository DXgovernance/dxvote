import useEtherSWR from 'ether-swr';
import { useParams } from 'react-router-dom';
import { bnum } from 'utils';

const emptyData = ['', '', '', '-0', '-0', '-0'];

export const useConfig = () => {
  const { guild_id: guildAddress } = useParams<{ guild_id?: string }>();
  const { data, error, isValidating } = useEtherSWR(
    [
      [guildAddress, 'getToken'], // @dev Get the address of the ERC20Token used for voting
      [guildAddress, 'getPermissionRegistry'], // @dev Get the address of the permission registry contract
      [guildAddress, 'getName'], // @dev Get the name of the ERC20Guild
      [guildAddress, 'getProposalTime'], // @dev Get the proposalTime (seconds)
      [guildAddress, 'getTimeForExecution'], // @dev Get the timeForExecution (seconds)
      [guildAddress, 'getMaxActiveProposals'], // @dev Get the maxActiveProposals
    ],
    {
      refreshInterval: 0,
      initialData: emptyData,
    }
  );

  const [
    token,
    permissionRegistry,
    name,
    proposalTime,
    timeForExecution,
    maxActiveProposals,
  ] = data || emptyData;

  return {
    error,
    isValidating,
    data: {
      token,
      permissionRegistry,
      name,
      proposalTime: bnum(proposalTime),
      timeForExecution: bnum(timeForExecution),
      maxActiveProposals: bnum(maxActiveProposals),
    },
  };
};
