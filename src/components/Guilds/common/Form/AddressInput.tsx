import Avatar from 'components/Guilds/Avatar';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { isAddress, MAINNET_ID } from 'utils';
import Input, { InputProps } from './Input';

const AddressInput: React.FC<InputProps<string>> = ({
  value,
  onChange,
  isInvalid,
  ...rest
}) => {
  const { imageUrl } = useENSAvatar(value, MAINNET_ID);
  const shouldShowAvatar = !!isAddress(value) || value?.endsWith('.eth');

  return (
    <Input
      {...rest}
      value={value}
      icon={
        <div>
          {shouldShowAvatar && !isInvalid && (
            <Avatar src={imageUrl} defaultSeed={value} size={24} />
          )}
        </div>
      }
      onChange={e => onChange(e.target.value)}
      isInvalid={isInvalid}
    />
  );
};

export default AddressInput;