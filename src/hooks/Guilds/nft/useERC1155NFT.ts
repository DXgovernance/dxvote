import { useEffect, useState } from 'react';
import { resolveUri } from '../../../utils/url';
import useContract from '../contracts/useContract';
import ERC1155abi from '../../../abis/ERC1155.json';

export default function useERC1155NFT(
  contractId: string,
  tokenId: string,
  ownerAddress?: string,
  web3Context?: string
) {
  const contract = useContract(contractId, ERC1155abi, web3Context);
  const [metadata, setMetadata] = useState<any>({});
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (!contract) {
      setMetadata({});
      return;
    }

    async function getBalance() {
      return contract.balanceOf(ownerAddress, tokenId);
    }

    async function getNFTDetails() {
      const tokenUri = await contract.uri(tokenId);
      const nftMetadataUri = resolveUri(tokenUri);
      const response = await fetch(nftMetadataUri);
      const metadata = await response.json();
      return metadata;
    }

    getBalance()
      .then(setBalance)
      .catch(e => {
        console.error('[useERC721NFT] Error getting NFT balance', e);
      });
    getNFTDetails()
      .then(setMetadata)
      .catch(e => {
        console.error('[useERC721NFT] Error getting NFT metadata', e);
      });
  }, [tokenId, contract, ownerAddress]);

  return { metadata, contract, balance };
}
