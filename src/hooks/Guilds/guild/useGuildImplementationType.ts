import { useMemo, useEffect, useState } from 'react';
import useJsonRpcProvider from '../web3/useJsonRpcProvider';
import { GuildImplementationType } from '../../../types/types.guilds.d';
import deployedHashedBytecodes from '../../../bytecodes/config.json';
import sha256 from 'crypto-js/sha256';

/**
 * @function useGuildImplementationType
 * @param {string} guildAddress
 * @returns {string} GuildImplementationType. 'SnapshotRepERC20Guild' | 'DXDGuild' | 'ERC20Guild' | 'IERC20Guild'
 */
export default function useGuildImplementationType(
  guildAddress: string
): GuildImplementationType {
  const [guildBytecode, setGuildBytecode] = useState<string>('');
  const provider = useJsonRpcProvider();

  useEffect(() => {
    const getBytecode = async () => {
      const hashedBytecode = sha256(
        await provider.getCode(guildAddress)
      ).toString();
      setGuildBytecode(hashedBytecode);
    };
    getBytecode();
  }, [guildAddress, provider]);

  const implementationType: GuildImplementationType = useMemo(() => {
    if (!guildBytecode) return GuildImplementationType.IERC20Guild;

    const match = deployedHashedBytecodes.find(
      ({ bytecode }) => guildBytecode === bytecode
    );

    return match ? match.type : GuildImplementationType.IERC20Guild; // default to IERC20Guild
  }, [guildBytecode]) as GuildImplementationType;

  return implementationType;
}
