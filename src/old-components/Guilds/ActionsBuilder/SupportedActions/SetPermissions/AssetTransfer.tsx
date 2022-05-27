import { useState } from 'react';
import Input from 'old-components/Guilds/common/Form/Input';
import Avatar from 'old-components/Guilds/Avatar';
import { FiChevronDown } from 'react-icons/fi';
import { resolveUri } from 'utils/url';
import {
  Control,
  ControlLabel,
  ControlRow,
} from 'Components/Primitives/Forms/Control';
import { StyledTokenAmount, ToggleWrapper, ToggleLabel } from './styles';
import Toggle from 'old-components/Guilds/common/Form/Toggle';
import TokenPicker from 'old-components/Guilds/TokenPicker';
import { ParsedDataInterface, ValidationsInterface } from './types';
import { BigNumber } from 'ethers';
import AddressInput from 'old-components/Guilds/common/Form/AddressInput';

interface AssetTransferProps {
  validations: ValidationsInterface;
  parsedData: ParsedDataInterface;
  tokenInfo: any;
  token: any;
  customAmountValue: BigNumber;
  handleTokenAmountInputChange: (e: BigNumber) => void;
  maxValueToggled: boolean;
  handleToggleMaxValueChange: () => void;
  handleAssetChange: (asset: string) => void;
  customToAddress: string;
  handleCustomAddress: (value: string) => void;
  pickedAsset: string;
  anyAddressToggled: boolean;
  handleToggleAnyAddressChange: () => void;
}

const AssetTransfer: React.FC<AssetTransferProps> = ({
  validations,
  parsedData,
  tokenInfo,
  token,
  customAmountValue,
  handleTokenAmountInputChange,
  maxValueToggled,
  handleToggleMaxValueChange,
  handleAssetChange,
  customToAddress,
  handleCustomAddress,
  pickedAsset,
  anyAddressToggled,
  handleToggleAnyAddressChange,
}) => {
  const [isTokenPickerOpen, setIsTokenPickerOpen] = useState(false);

  return (
    <div>
      <Control>
        <ControlLabel>Asset</ControlLabel>
        <ControlRow onClick={() => setIsTokenPickerOpen(true)}>
          <Input
            name="asset"
            aria-label="asset picker"
            value={tokenInfo?.symbol || ''}
            placeholder="Token"
            icon={
              <div>
                {pickedAsset && (
                  <Avatar
                    src={resolveUri(token?.logoURI)}
                    defaultSeed={pickedAsset}
                    size={18}
                  />
                )}
              </div>
            }
            iconRight={<FiChevronDown size={24} />}
            readOnly
          />
        </ControlRow>
        <TokenPicker
          walletAddress={parsedData?.to[0] || ''}
          isOpen={isTokenPickerOpen}
          onClose={() => setIsTokenPickerOpen(false)}
          onSelect={asset => {
            handleAssetChange(asset);
            setIsTokenPickerOpen(false);
          }}
        />
      </Control>

      <Control>
        <ControlLabel>To address</ControlLabel>
        <ControlRow>
          <AddressInput
            value={customToAddress}
            onChange={handleCustomAddress}
            isInvalid={!validations.to}
            name="to-address"
            aria-label="to address input"
            disabled={anyAddressToggled}
            placeholder="Ethereum address"
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

export default AssetTransfer;
