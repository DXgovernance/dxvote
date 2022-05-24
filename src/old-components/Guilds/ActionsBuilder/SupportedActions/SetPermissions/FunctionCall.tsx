import {
  Control,
  ControlLabel,
  ControlRow,
} from 'Components/Primitives/Forms/Control';
import Input from 'old-components/Guilds/common/Form/Input';
import { StyledTokenAmount, ToggleWrapper, ToggleLabel } from './styles';
import { ParsedDataInterface, ValidationsInterface } from './types';
import styled from 'styled-components';
import Toggle from 'old-components/Guilds/common/Form/Toggle';
import { BigNumber } from 'ethers';
import AddressInput from './AddressInput';

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
  tokenInfo: any;
  customAmountValue: BigNumber;
  handleTokenAmountInputChange: (e: string) => void;
  maxValueToggled: boolean;
  handleToggleMaxValueChange: () => void;
  setAsset: (asset: string) => void;
  anyAddressToggled: boolean;
  handleToggleAnyAddressChange: () => void;
}

const FunctionCall: React.FC<FunctionCallProps> = ({
  validations,
  destinationAvatarUrl,
  parsedData,
  handleCustomFunctionSignature,
  customToAddress,
  handleCustomAddress,
  customFunctionName,
  tokenInfo,
  customAmountValue,
  handleTokenAmountInputChange,
  maxValueToggled,
  handleToggleMaxValueChange,
  setAsset,
  anyAddressToggled,
  handleToggleAnyAddressChange,
}) => {
  // ? maybe change the input validation so it doesn't validates until blur?

  return (
    <div>
      <Control>
        <ControlLabel>To address</ControlLabel>
        <ControlRow>
          <AddressInput
            customToAddress={customToAddress}
            anyAddressToggled={anyAddressToggled}
            validations={validations}
            destinationAvatarUrl={destinationAvatarUrl}
            parsedData={parsedData}
            handleCustomAddress={handleCustomAddress}
          />
          <ToggleWrapper>
            <Toggle
              name="toggle-any-address"
              aria-label="toggle any address"
              value={anyAddressToggled}
              onChange={handleToggleAnyAddressChange}
            />
            <ToggleLabel selected={anyAddressToggled}>Any address</ToggleLabel>
          </ToggleWrapper>
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
      <Control>
        <ControlLabel>Amount</ControlLabel>
        <ControlRow>
          <StyledTokenAmount
            name="amount"
            aria-label="amount input"
            decimals={tokenInfo?.decimals}
            value={customAmountValue}
            onChange={handleTokenAmountInputChange}
            disabled={maxValueToggled}
          />
          <ToggleWrapper>
            <Toggle
              name="toggle-max-value"
              aria-label="toggle max value"
              value={maxValueToggled}
              onChange={handleToggleMaxValueChange}
            />
            <ToggleLabel selected={maxValueToggled}>Max value</ToggleLabel>
          </ToggleWrapper>
        </ControlRow>
      </Control>
    </div>
  );
};

export default FunctionCall;
