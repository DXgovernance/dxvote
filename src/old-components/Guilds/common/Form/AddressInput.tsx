import Input, { InputProps } from './Input';
import { isAddress } from 'utils';
import ENSAvatar from 'Components/ENSAvatar/ENSAvatar';

const AddressInput: React.FC<InputProps<string>> = ({
  value,
  onChange,
  isInvalid,
  ...rest
}) => {
  const shouldShowAvatar = !!isAddress(value) || value?.endsWith('.eth');

  return (
    <Input
      {...rest}
      value={value}
      icon={
        <div>
          {shouldShowAvatar && !isInvalid && <ENSAvatar address={value} />}
        </div>
      }
      onChange={e => onChange(e.target.value)}
      isInvalid={isInvalid}
    />
  );
};

export default AddressInput;
