import { useMemo, useEffect, useState } from 'react';
import { utils } from 'ethers';
import useJsonRpcProvider from '../web3/useJsonRpcProvider';
import { GuildImplementationType } from '../../../types/types.guilds.d';
import deployedHashedBytecodes from '../../../bytecodes/config.json';

const defaultImplementation = deployedHashedBytecodes.find(
  ({ type }) => type === GuildImplementationType.IERC20Guild
) ?? {
  type: GuildImplementationType.IERC20Guild,
  features: [],
  bytecode_hash: '',
};

interface ImplementationTypeConfig {
  type: string;
  features: string[];
  bytecode_hash: string;
}

interface ImplementationTypeConfigReturn extends ImplementationTypeConfig {
  isRep: boolean;
  isSnapshot: boolean;
}
const parseConfig = (
  config: ImplementationTypeConfig
): ImplementationTypeConfigReturn => {
  return {
    ...config,
    isRep: config.features.includes('REP'),
    isSnapshot: config.features.includes('SNAPSHOT'),
  };
};

/**
 * @function useGuildImplementationType
 * @param {string} guildAddress
 * @returns {string} GuildImplementationType. 'SnapshotRepERC20Guild' | 'DXDGuild' | 'ERC20Guild' | 'IERC20Guild'
 */
export default function useGuildImplementationTypeConfig(
  guildAddress: string
): ImplementationTypeConfigReturn {
  const [guildBytecode, setGuildBytecode] = useState<string>('');
  const provider = useJsonRpcProvider();

  useEffect(() => {
    const getBytecode = async () => {
      const hashedBytecode = utils.sha256(await provider.getCode(guildAddress));
      setGuildBytecode(hashedBytecode);
    };
    getBytecode();
  }, [guildAddress, provider]);

  const implementationTypeConfig: ImplementationTypeConfig = useMemo(() => {
    if (!guildBytecode) return defaultImplementation;

    const match = deployedHashedBytecodes.find(
      ({ bytecode_hash }) => guildBytecode === bytecode_hash
    );

    return match ? match : defaultImplementation; // default to IERC20Guild
  }, [guildBytecode]);

  return parseConfig(implementationTypeConfig);
}
