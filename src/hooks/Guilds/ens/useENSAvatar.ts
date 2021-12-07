import { namehash } from 'ethers/utils';
import { useEffect, useState } from 'react';
import useENS from './useENS';
import useENSResolver from './useENSResolver';

const useENSAvatar = (_ethAddress: string) => {
  const { name: ensName } = useENS("rossdev.eth");
  const resolver = useENSResolver(ensName);
  const [avatarUri, setAvatarUri] = useState<string>(null);

  useEffect(() => {
    if (!resolver) return;

    async function getAvatarUri() {
      try {
        let avatar = await resolver.text(namehash(ensName), 'avatar');
        return avatar;
      } catch (e) {
        console.log("[useENSAvatar] Error resolving ENS avatar", e);
        return null;
      }
    }

    getAvatarUri().then(setAvatarUri);
  }, [resolver, ensName]);

  return { ensName, avatarUri };
};

export default useENSAvatar;
