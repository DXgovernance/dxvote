import { useState } from 'react';
import Input from 'old-components/Guilds/common/Form/Input';
import Avatar from 'old-components/Guilds/Avatar';
import { FiChevronDown, FiX } from 'react-icons/fi';
import { resolveUri } from 'utils/url';
import {
  Control,
  ControlLabel,
  ControlRow,
} from 'Components/Primitives/Forms/Control';
import {
  ClickableIcon,
  StyledTokenAmount,
  ToggleWrapper,
  ToggleLabel,
} from './styles';
import Toggle from 'old-components/Guilds/common/Form/Toggle';
import TokenPicker from 'old-components/Guilds/TokenPicker';
import { ParsedDataInterface, ValidationsInterface } from './types';
import { BigNumber } from 'ethers';

interface AssetTransferProps {
  validations: ValidationsInterface;
  destinationAvatarUrl: any;
  parsedData: ParsedDataInterface;
  tokenInfo: any;
  token: any;
  customAmountValue: BigNumber;
  handleTokenAmountInputChange: (e: string) => void;
  maxValueToggled: boolean;
  handleToggleChange: () => void;
  handleAssetChange: (asset: string) => void;
  customToAddress: string;
  handleCustomAddress: (value: string) => void;
  pickedAsset: string;
}

const AssetTransfer: React.FC<AssetTransferProps> = ({
  validations,
  destinationAvatarUrl,
  parsedData,
  tokenInfo,
  token,
  customAmountValue,
  handleTokenAmountInputChange,
  maxValueToggled,
  handleToggleChange,
  handleAssetChange,
  customToAddress,
  handleCustomAddress,
  pickedAsset,
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
                <ClickableIcon
                  aria-label="clear field to address"
                  onClick={() => handleCustomAddress('')}
                >
                  <FiX size={18} />
                </ClickableIcon>
              ) : null
            }
            placeholder="Ethereum address"
            onChange={e => handleCustomAddress(e.target.value)}
          />
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
              onChange={handleToggleChange}
            />
            <ToggleLabel selected={maxValueToggled}>Max value</ToggleLabel>
          </ToggleWrapper>
        </ControlRow>
      </Control>
    </div>
  );
};

export default AssetTransfer;
