import { useEffect, useState } from 'react';
import { resolveUri } from '../../../utils/url';
import useContract from '../contracts/useContract';
import ERC721abi from '../../../abis/ERC721.json';

export default function useERC721NFT(
  contractId: string,
  tokenId: string,
  web3Context?: string
) {
  const contract = useContract(contractId, ERC721abi, web3Context);
  const [ownerAddress, setOwnerAddress] = useState<string>(null);
  const [metadata, setMetadata] = useState<any>({});

  useEffect(() => {
    if (!contract) {
      setOwnerAddress(null);
      setMetadata({});
      return;
    }

    async function getNFTOwner() {
      const nftOwner = await contract.ownerOf(tokenId);
      return nftOwner;
    }

    async function getNFTDetails() {
      const tokenUri = await contract.tokenURI(tokenId);
      const nftMetadataUri = resolveUri(tokenUri);
      const response = await fetch(nftMetadataUri);
      const metadata = await response.json();
      return metadata;
    }

    getNFTOwner()
      .then(setOwnerAddress)
      .catch(e => {
        console.error('[useERC721NFT] Error getting NFT owner', e);
      });
    getNFTDetails()
      .then(setMetadata)
      .catch(e => {
        console.error('[useERC721NFT] Error getting NFT metadata', e);
      });
  }, [tokenId, contract]);

  return { ownerAddress, metadata, contract };
}
