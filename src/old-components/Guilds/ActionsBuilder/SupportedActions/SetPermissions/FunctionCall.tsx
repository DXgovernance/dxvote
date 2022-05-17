import {
  Control,
  ControlLabel,
  ControlRow,
} from 'Components/Primitives/Forms/Control';
import Input from 'old-components/Guilds/common/Form/Input';
import Avatar from 'old-components/Guilds/Avatar';
import { ClickableIcon } from './styles';
import { FiX } from 'react-icons/fi';
import { ParsedDataInterface, ValidationsInterface } from './types';

interface FunctionCallProps {
  validations: ValidationsInterface;
  destinationAvatarUrl: any;
  parsedData: ParsedDataInterface;
  handleCustomFunctionSignature: (value: string) => void;
  customToAddress: string;
  handleCustomAddress: (value: string) => void;
  customFunctionSignature: string;
}

const FunctionCall: React.FC<FunctionCallProps> = ({
  validations,
  destinationAvatarUrl,
  parsedData,
  handleCustomFunctionSignature,
  customToAddress,
  handleCustomAddress,
  customFunctionSignature,
}) => {
  return (
    <div>
      <Control>
        <ControlLabel>To address</ControlLabel>
        <ControlRow>
          <Input
            name="to-address"
            aria-label="to address input"
            value={customToAddress}
            icon={
              <div>
                {validations.to && (
                  <Avatar
                    src={destinationAvatarUrl}
                    defaultSeed={parsedData.to}
                    size={24}
                  />
                )}
              </div>
            }
            iconRight={
              parsedData?.to ? (
                <ClickableIcon onClick={() => handleCustomAddress('')}>
                  <FiX size={18} />
                </ClickableIcon>
              ) : null
            }
            placeholder="Ethereum address"
            onChange={e => {
              handleCustomAddress(e.target.value);
            }}
          />
        </ControlRow>
      </Control>
      <Control>
        <ControlLabel>Function signature</ControlLabel>
        <ControlRow>
          <Input
            name="function-signature"
            aria-label="function signature input"
            value={customFunctionSignature || ''}
            placeholder="Function signature"
            onChange={e => handleCustomFunctionSignature(e.target.value)}
          />
        </ControlRow>
      </Control>
    </div>
  );
};

export default FunctionCall;
