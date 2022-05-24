import { ParsedDataInterface, ValidationsInterface } from './types';
import { ClickableIcon } from './styles';
import Input from 'old-components/Guilds/common/Form/Input';
import Avatar from 'old-components/Guilds/Avatar';
import { FiX } from 'react-icons/fi';

interface AddressButtonProps {
  customToAddress: string;
  anyAddressToggled: boolean;
  validations: ValidationsInterface;
  destinationAvatarUrl: any;
  parsedData: ParsedDataInterface;
  handleCustomAddress: (value: string) => void;
}

const AddressInput: React.FC<AddressButtonProps> = ({
  customToAddress,
  anyAddressToggled,
  validations,
  destinationAvatarUrl,
  parsedData,
  handleCustomAddress,
}) => {
  return (
    <Input
      name="to-address"
      aria-label="to address input"
      value={customToAddress}
      disabled={anyAddressToggled}
      isInvalid={!validations.to}
      icon={
        <div>
          {validations.to && (
            <Avatar
              src={destinationAvatarUrl}
              defaultSeed={customToAddress || parsedData.to[0]}
              size={24}
            />
          )}
        </div>
      }
      iconRight={
        parsedData?.to[0] && !anyAddressToggled ? (
          <ClickableIcon
            aria-label="clear field to address"
            onClick={() => {
              handleCustomAddress('');
            }}
          >
            <FiX size={18} />
          </ClickableIcon>
        ) : null
      }
      placeholder="Ethereum address"
      onChange={e => {
        handleCustomAddress(e.target.value);
      }}
    />
  );
};

export default AddressInput;
