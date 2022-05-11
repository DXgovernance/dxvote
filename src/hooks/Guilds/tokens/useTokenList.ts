import { useMemo } from 'react';
import { TokenList } from '@uniswap/token-lists';
import { useParams } from 'react-router-dom';
import useIPFSFile from '../ipfs/useIPFSFile';
import useNetworkConfig from 'hooks/Guilds/useNetworkConfig';

// TODO: Update to the DXgov curated token list once its ready
const SWAPR_TOKEN_LIST = 'QmSbyVo6Kz5BuqyAHYcN7UkeCk5cALFp6QmPUN6NtPpDWL';

export const useTokenList = (chainId?: number) => {
  const tokenList = useIPFSFile<TokenList>(SWAPR_TOKEN_LIST);
  const { chain_name: chainName } = useParams<{ chain_name?: string }>();
  const config = useNetworkConfig(chainId);
  const tokens = useMemo(() => {
    let list = tokenList.data?.tokens || [];

    if (chainId) {
      list = list.filter(token => token.chainId === chainId);
    }
    if (chainName === 'localhost' && config?.tokens) {
      // for localhost, we add the tokens from local config file
      config?.tokens?.forEach(token => {
        list.push({
          ...token,
          chainId,
        });
      });
    }

    return list;
  }, [chainId, tokenList]);

  return { tokens };
};
