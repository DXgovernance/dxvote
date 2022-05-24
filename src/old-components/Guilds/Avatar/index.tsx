import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import styled from 'styled-components';
import { ButtonIcon } from '../common/Button';

interface AvatarProps {
  src?: string;
  defaultSeed: string;
  size?: number;
}

const AvatarIcon = styled(ButtonIcon)<{ size: number }>`
  border-radius: 50%;
  ${({ size }) =>
    size &&
    `
      height: ${size}px;
      width: ${size}px;
    `}
`;

const Avatar: React.FC<AvatarProps> = ({ src, defaultSeed, size = 24 }) => {
  return src ? (
    <AvatarIcon data-testid="avatar" src={src} alt={'Avatar'} size={size} />
  ) : (
    <Jazzicon
      data-testid="jazzicon"
      diameter={size}
      seed={jsNumberForAddress(defaultSeed)}
    />
  );
};

export default Avatar;
