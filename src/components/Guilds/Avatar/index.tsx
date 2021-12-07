import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { ButtonIcon } from '../common/Button';
interface AvatarProps {
  src?: string;
  defaultSeed?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, defaultSeed }) => {
  return src ? (
    <ButtonIcon src={src} alt={'Avatar'} />
  ) : (
    <Jazzicon diameter={18} seed={jsNumberForAddress(defaultSeed)} />
  );
};

export default Avatar;
