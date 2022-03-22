import { useMemo, useEffect, useState } from 'react';
import useJsonRpcProvider from '../web3/useJsonRpcProvider';
import { GuildImplementationType } from '../../../types/types.guilds.d';
import deployedBytecodes from '../../../bytecodes/config.json';

/**
 * @function useGuildImplementationType
 * @param guildAddress address
 * @returns {string} GuildImplementationType. 'SnapshotRepERC20Guild' | 'DXDGuild' | 'ERC20Guild' | 'IERC20Guild'
 */
export default function useGuildImplementationType(
  guildAddress: string
): GuildImplementationType {
  const [guildBytecode, setGuildBytecode] = useState<string>('');
  const provider = useJsonRpcProvider();

  useEffect(() => {
    const getBytecode = async () => {
      const bytecode = await provider.getCode(guildAddress);
      setGuildBytecode(bytecode);
    };
    getBytecode();
  }, [guildAddress, provider]);

  const implementationType: GuildImplementationType = useMemo(() => {
    if (!guildBytecode) return GuildImplementationType.IERC20Guild;

    const match = deployedBytecodes.find(({ bytecode }) => {
      return guildBytecode === bytecode;
    });

    return match ? match.type : GuildImplementationType.IERC20Guild; // default to IERC20Guild
  }, [guildBytecode]) as GuildImplementationType;

  return implementationType;
}
