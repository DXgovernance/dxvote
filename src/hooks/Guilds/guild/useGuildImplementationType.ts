import { useMemo, useEffect, useState } from 'react';
import { utils } from 'ethers';
import useJsonRpcProvider from '../web3/useJsonRpcProvider';
import { GuildImplementationType } from '../../../types/types.guilds.d';
import deployedHashedBytecodes from '../../../bytecodes/config.json';
import localDeployedHashedByteCodes from '../../../bytecodes/config.local.json';
import { useWeb3React } from '@web3-react/core';

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
  isRepGuild: boolean;
  isSnapshotGuild: boolean;
  isSnapshotRepGuild: boolean;
}
const parseConfig = (
  config: ImplementationTypeConfig
): ImplementationTypeConfigReturn => {
  return {
    ...config,
    isRepGuild:
      config.features.includes('REP') && !config.features.includes('SNAPSHOT'),
    isSnapshotGuild:
      config.features.includes('SNAPSHOT') && !config.features.includes('REP'),
    isSnapshotRepGuild:
      config.features.includes('SNAPSHOT') && config.features.includes('REP'),
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
  const { chainId } = useWeb3React();
  useEffect(() => {
    const getBytecode = async () => {
      const btcode = await provider.getCode(guildAddress);
      const hashedBytecode = utils.sha256(btcode);
      setGuildBytecode(hashedBytecode);
    };
    getBytecode();
  }, [guildAddress, provider]);

  const implementationTypeConfig: ImplementationTypeConfig = useMemo(() => {
    if (!guildBytecode) return defaultImplementation;
    let match: ImplementationTypeConfig;
    switch (chainId) {
      case 1337: // localhost
        match = localDeployedHashedByteCodes.find(
          ({ bytecode_hash }) => bytecode_hash === guildBytecode
        );
        break;
      default:
        match = deployedHashedBytecodes.find(
          ({ bytecode_hash }) => guildBytecode === bytecode_hash
        );
    }
    return match ? match : defaultImplementation; // default to IERC20Guild
  }, [guildBytecode]);
  return parseConfig(implementationTypeConfig);
}
