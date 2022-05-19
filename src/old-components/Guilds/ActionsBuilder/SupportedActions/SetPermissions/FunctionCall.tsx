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
import styled from 'styled-components';

const FunctionSignatureWrapper = styled.div`
  color: ${({ theme }) => theme.colors.proposalText.grey};
  margin-left: 1.5rem;
  margin-top: 0.5rem;
`;

interface FunctionCallProps {
  validations: ValidationsInterface;
  destinationAvatarUrl: any;
  parsedData: ParsedDataInterface;
  handleCustomFunctionSignature: (value: string) => void;
  customToAddress: string;
  handleCustomAddress: (value: string) => void;
  customFunctionName: string;
}

const FunctionCall: React.FC<FunctionCallProps> = ({
  validations,
  destinationAvatarUrl,
  parsedData,
  handleCustomFunctionSignature,
  customToAddress,
  handleCustomAddress,
  customFunctionName,
}) => {
  // ? maybe change the input validation so it doesn't validates until blur?

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
                    defaultSeed={parsedData.to[0]}
                    size={24}
                  />
                )}
              </div>
            }
            iconRight={
              parsedData?.to[0] ? (
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
        <ControlLabel>Function name</ControlLabel>
        <ControlRow>
          <Input
            isInvalid={!validations.functionName}
            name="function-signature"
            aria-label="function signature input"
            value={customFunctionName || ''}
            placeholder="Function name"
            onChange={e => handleCustomFunctionSignature(e.target.value)}
          />
        </ControlRow>
        <ControlRow>
          {customFunctionName.substring(0, 2) !== '0x' && (
            <FunctionSignatureWrapper>
              Function signature: {parsedData?.functionSignature}
            </FunctionSignatureWrapper>
          )}
        </ControlRow>
      </Control>
    </div>
  );
};

export default FunctionCall;
