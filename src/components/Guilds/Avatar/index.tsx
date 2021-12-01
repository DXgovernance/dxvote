import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { MAINNET_WEB3_ROOT_KEY } from '../../MainnetWeb3Manager';
import { ButtonIcon } from '../common/Button';
import ERC721abi from '../../../abis/ERC721.json';
import ERC1155abi from '../../..//abis/ERC1155.json';
interface AvatarProps {
  ensAvatarUri?: string;
  address?: string;
}

const Avatar: React.FC<AvatarProps> = ({ ensAvatarUri, address }) => {
  const [url, setUrl] = useState<string | null>(null);
  const web3Context = useWeb3React(MAINNET_WEB3_ROOT_KEY);

  useEffect(() => {
    if (ensAvatarUri) {
      resolveAvatarUri(ensAvatarUri)
        .then(res => {
          console.log('[Avatar] Got ENS avatar uri', res);
          return res;
        })
        .then(setUrl)
        .catch(e => {
          console.error('[Avatar] Error while resolving ENS avatar uri', e);
          setUrl(null);
        });
    } else {
      setUrl(null);
    }
  }, [ensAvatarUri]);

  async function resolveAvatarUri(avatarUri: string) {
    // Match <scheme>://<path> format
    let match = new RegExp(/([a-z]+):\/\/(.*)/).exec(avatarUri);
    if (match && match.length === 3) {
      return resolveUri(avatarUri);
    }

    // Don't resolve NFTs if no address is provided, as it won't be verifiable
    if (!address) return null;

    const web3 = web3Context.library;
    // Match ERC-721 NFT reference
    match = new RegExp(/eip155:1\/erc721:(\w+)\/(\w+)/).exec(avatarUri);
    if (match && match.length === 3) {
      const contractId = match[1].toLowerCase();
      const tokenId = match[2];

      const erc721Contract = new web3.eth.Contract(ERC721abi, contractId);

      const owner = await erc721Contract.methods.ownerOf(tokenId).call();
      if (!owner || owner.toLowerCase() !== address.toLowerCase()) {
        return null;
      }
      const tokenUri = await erc721Contract.methods.tokenURI(tokenId).call();
      const nftMetadataUri = resolveUri(tokenUri);
      const nftMetadata = await resolveNFTMetadata(nftMetadataUri);
      return resolveUri(nftMetadata.image);
    }

    // Match ERC-1155 NFT reference
    match = new RegExp(/eip155:1\/erc1155:(\w+)\/(\w+)/).exec(avatarUri);
    if (match && match.length === 3) {
      const contractId = match[1].toLowerCase();
      const tokenId = match[2];

      const erc1155Contract = new web3.eth.Contract(ERC1155abi, contractId);
      const balance = await erc1155Contract.methods
        .balanceOf(address, tokenId)
        .call();
      if (balance == 0) return null;

      const tokenUri = await erc1155Contract.methods.uri(tokenId).call();
      const nftMetadataUri = resolveUri(tokenUri);
      const nftMetadata = await resolveNFTMetadata(nftMetadataUri);
      return resolveUri(nftMetadata.image);
    }

    return null;
  }

  const resolveUri = (avatarUri: string) => {
    let match = new RegExp(/([a-z]+):\/\/(.*)/).exec(avatarUri);
    if (!match || match.length != 3) return null;

    const scheme = match[1];
    const path = match[2];

    switch (scheme) {
      case 'ipfs':
        return `https://gateway.pinata.cloud/ipfs/${path}`;
      case 'ipns':
        return `https://gateway.pinata.cloud/ipns/${path}`;
      case 'http':
      case 'https':
        return avatarUri;
      default:
        return null;
    }
  };

  const resolveNFTMetadata = async (nftMetadataUri: string) => {
    console.log('[Avatar] resolving nft metadata:', nftMetadataUri);
    const response = await fetch(nftMetadataUri);
    const metadata = await response.json();
    console.log('[Avatar] resolving nft metadata:', metadata);

    return metadata;
  };

  return url ? (
    <ButtonIcon src={url} alt={'Avatar'} />
  ) : (
    <Jazzicon diameter={18} seed={jsNumberForAddress(address)} />
  );
};

export default Avatar;
