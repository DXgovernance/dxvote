import { useERC20Info } from '../ether-swr/erc20/useERC20Info';
import { useGuildConfig } from '../ether-swr/guild/useGuildConfig';
import { useTypedParams } from 'Modules/Guilds/Hooks/useTypedParams';

export const useTokenData = () => {
  const { guildId } = useTypedParams();
  const { data } = useGuildConfig(guildId);
  const { data: tokenData } = useERC20Info(data?.token);

  return {
    tokenData,
  };
};
