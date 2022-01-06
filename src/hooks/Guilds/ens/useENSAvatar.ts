import { utils } from 'ethers';
import { useEffect, useMemo } from 'react';
import { resolveUri } from '../../../utils/url';
import useENS from './useENS';
import useENSResolver from './useENSResolver';
import useERC721NFT from '../nft/useERC721NFT';
import useERC1155NFT from '../nft/useERC1155NFT';
import useLocalStorageWithExpiry from '../useLocalStorageWithExpiry';
import { useWeb3React } from '@web3-react/core';

const useENSAvatar = (
  ethAddress: string,
  chainId?: number
) => {
  const { chainId: walletChainId }= useWeb3React();
  const { name: ensName } = useENS(ethAddress, chainId);
  const resolver = useENSResolver(ensName, chainId);
  const [avatarUri, setAvatarUri] = useLocalStorageWithExpiry<string>(
    `ens/avatar/${chainId || walletChainId}/${ethAddress}`,
    null
  );
  const { imageUrl } = useENSAvatarNFT(avatarUri, ethAddress, chainId);

  useEffect(() => {
    if (!resolver || avatarUri) return;

    async function getAvatarUri() {
      try {
        let avatar = await resolver.text(utils.namehash(ensName), 'avatar');
        return avatar;
      } catch (e) {
        console.error('[useENSAvatar] Error resolving ENS avatar', e);
        return null;
      }
    }

    getAvatarUri().then(setAvatarUri);
  }, [resolver, ensName, avatarUri, setAvatarUri]);

  return { ensName, avatarUri, imageUrl };
};

const useENSAvatarNFT = (
  nftUri: string,
  ownerAddress: string,
  chainId?: number
) => {
  const decodedUrl = useMemo(() => {
    if (!nftUri) return {};

    let match = new RegExp(/([a-z]+):\/\/(.*)/).exec(nftUri);
    if (match && match.length === 3)
      return {
        type: 'http',
        imageUri: resolveUri(nftUri),
      };

    // Match ERC-721 NFT reference
    match = new RegExp(/eip155:1\/erc721:(\w+)\/(\w+)/).exec(nftUri);
    if (match && match.length === 3) {
      const contractId = match[1].toLowerCase();
      const tokenId = match[2];

      return {
        type: 'erc721',
        contractId,
        tokenId,
      };
    }

    match = new RegExp(/eip155:1\/erc1155:(\w+)\/(\w+)/).exec(nftUri);
    if (match && match.length === 3) {
      const contractId = match[1].toLowerCase();
      const tokenId = match[2];

      return {
        type: 'erc1155',
        contractId,
        tokenId,
      };
    }

    return {};
  }, [nftUri]);

  const { ownerAddress: ERC721Owner, metadata: ERC721Metadata } = useERC721NFT(
    decodedUrl.type === 'erc721' ? decodedUrl.contractId : null,
    decodedUrl.tokenId,
    chainId
  );
  const { balance: ERC1155Balance, metadata: ERC1155Metadata } = useERC1155NFT(
    decodedUrl.type === 'erc1155' ? decodedUrl.contractId : null,
    decodedUrl.tokenId,
    ownerAddress,
    chainId
  );

  let imageUrl: string = useMemo(() => {
    if (decodedUrl.type === 'http') {
      return decodedUrl.imageUri;
    } else if (
      decodedUrl.type === 'erc721' &&
      ERC721Owner?.toLowerCase() === ownerAddress.toLowerCase()
    ) {
      return ERC721Metadata.imageUri;
    } else if (decodedUrl.type === 'erc1155' && ERC1155Balance > 0) {
      return ERC1155Metadata.imageUri;
    }

    return null;
  }, [
    decodedUrl,
    ERC721Owner,
    ERC721Metadata,
    ERC1155Balance,
    ERC1155Metadata,
    ownerAddress,
  ]);

  return {
    imageUrl,
  };
};

export default useENSAvatar;
