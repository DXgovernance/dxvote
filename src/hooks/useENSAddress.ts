import { useEffect, useState } from 'react';
import { useContext } from '../contexts';

const useENSAddress = (ethAddress: string) => {
  const {
    context: { ensService },
  } = useContext();
  const [ensName, setEnsName] = useState<string>(null);
  const [avatarUri, setAvatarUri] = useState<string>(null);

  async function resolveENSDetails() {
    const ensName = await ensService.resolveENSName(ethAddress);
    const avatarUri = await ensService.resolveAvatarUri(ensName);

    setEnsName(ensName);
    setAvatarUri(avatarUri);
  }

  useEffect(() => {
    if (ethAddress) resolveENSDetails();
  }, [ethAddress]);

  return { ensName, avatarUri };
};

export default useENSAddress;
