import { useMemo } from 'react';
import { resolveUri } from '../../../../utils/url';
import ERC1155abi from '../../../../abis/ERC1155.json';
import useJsonRpcProvider from 'hooks/Guilds/web3/useJsonRpcProvider';
import useEtherSWR from '../useEtherSWR';
import { BigNumber } from 'ethers';
import useSWR from 'swr';

type ERC1155Data = {
  balanceOf: BigNumber;
  uri: string;
};

export default function useERC1155NFT(
  contractId: string,
  tokenId: string,
  ownerAddress?: string,
  chainId?: number
) {
  const provider = useJsonRpcProvider(chainId);
  const { data: result } = useEtherSWR(
    contractId
      ? [
          [contractId, 'balanceOf', ownerAddress, tokenId],
          [contractId, 'uri', tokenId],
        ]
      : [],
    {
      web3Provider: provider,
      ABIs: new Map([[contractId, ERC1155abi]]),
      refreshInterval: 0,
    }
  );

  const nftData: ERC1155Data = useMemo(() => {
    if (!result) return undefined;

    const [balanceOf, uri] = result;
    return {
      balanceOf,
      uri: resolveUri(uri),
    };
  }, [result]);

  const { data: metadata } = useSWR(nftData?.uri);

  return { metadata, balance: nftData?.balanceOf };
}
