import Avatar from 'components/Guilds/Avatar';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { MAINNET_ID } from 'utils';
import Input, { InputProps } from './Input';

const AddressInput: React.FC<InputProps<string>> = ({
  value,
  onChange,
  ...rest
}) => {
  const { imageUrl } = useENSAvatar(value, MAINNET_ID);

  return (
    <Input
      {...rest}
      value={value}
      icon={
        <div>
          {value && <Avatar src={imageUrl} defaultSeed={value} size={24} />}
        </div>
      }
      onChange={e => onChange(e.target.value)}
    />
  );
};

export default AddressInput;
