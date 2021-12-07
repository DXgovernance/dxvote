import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { ButtonIcon } from '../common/Button';
import styled from "styled-components";
interface AvatarProps {
  src?: string;
  defaultSeed?: string;
  size?: number;
}

const AvatarIcon = styled(ButtonIcon)`
  border-radius: 50%;
  height: ${props => props.height}px;
  width: ${props => props.height}px;
`;

const Avatar: React.FC<AvatarProps> = ({ src, defaultSeed, size = 34 }) => {
  return src ? (
    <AvatarIcon src={src} alt={'Avatar'} size={size} />
  ) : (
    <Jazzicon diameter={size} seed={jsNumberForAddress(defaultSeed)} />
  );
};

export default Avatar;
