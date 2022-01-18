import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import styled from 'styled-components';
import { ButtonIcon } from '../common/Button';

interface AvatarProps {
  src?: string;
  defaultSeed: string;
  size?: number;
}

const AvatarIcon = styled(ButtonIcon)`
  border-radius: 50%;
  height: ${props => props.size}px;
  width: ${props => props.size}px;
`;

const Avatar: React.FC<AvatarProps> = ({ src, defaultSeed, size = 24 }) => {
  return src ? (
    <AvatarIcon data-testid="avatarSrc" src={src} alt={'Avatar'} size={size} />
  ) : (
    <Jazzicon
      data-testid="avatarNoSrc"
      diameter={size}
      seed={jsNumberForAddress(defaultSeed)}
    />
  );
};

export default Avatar;
