import { useTypedParams } from 'stories/Modules/Guilds/Hooks/useTypedParams';
import { useGuildConfig } from '../ether-swr/guild/useGuildConfig';
import { useERC20Info } from '../ether-swr/erc20/useERC20Info';

export const useTokenData = () => {
  const { guildId } = useTypedParams();
  const { data } = useGuildConfig(guildId);
  const { data: tokenData } = useERC20Info(data?.token);

  return {
    tokenData,
  };
};
