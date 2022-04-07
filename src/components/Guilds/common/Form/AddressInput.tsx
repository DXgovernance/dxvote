import Avatar from 'components/Guilds/Avatar';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { MAINNET_ID } from 'utils';
import Input, { InputProps } from './Input';

type AddressInputProps = {
  value: string;
  onValueChange: (input: string) => void;
  error?: boolean;
  fontSize?: string;
  align?: 'right' | 'left';
} & InputProps;

const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onValueChange,
  ...rest
}) => {
  const { imageUrl } = useENSAvatar(value, MAINNET_ID);

  return (
    <Input
      {...rest}
      value={value}
      icon={
        <div>
          <Avatar src={imageUrl} defaultSeed={value} size={24} />
        </div>
      }
      onChange={e => onValueChange(e.target.value)}
    />
  );
};

export default AddressInput;
