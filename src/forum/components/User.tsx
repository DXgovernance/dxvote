import styled from 'styled-components';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import Avatar from 'components/Guilds/Avatar';
import { Text } from './common/Box';

export function CommentAvatar({ address }) {
  const avatar = useENSAvatar(address);
  const user = avatar.ensName || address;
  return (
    <AvatarBorder>
      <Avatar defaultSeed={user || ''} src={avatar.imageUrl || ''} size={24} />
    </AvatarBorder>
  );
}

const AvatarBorder = styled.div`
  padding: 8px;
  border-radius ${({ theme }) => theme.radii.rounded};
  border: 1px solid ${({ theme }) => theme.colors.muted};
  margin-right: 8px; // Do we have some kind of spacing config for consistency?
  height: 24px; // Avatar is inline-block which messes up the box
`;

export function ENSName({ address, ...props }) {
  const avatar = useENSAvatar(address);
  const user = avatar.ensName || address;
  return <Text {...props}>{user}</Text>;
}

