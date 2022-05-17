import { useState } from 'react';
import Input from 'old-components/Guilds/common/Form/Input';
import Avatar from 'old-components/Guilds/Avatar';
import { FiChevronDown, FiX } from 'react-icons/fi';
import TokenAmountInput from 'old-components/Guilds/common/Form/TokenAmountInput';
import { resolveUri } from 'utils/url';
import {
  Control,
  ControlLabel,
  ControlRow,
} from 'Components/Primitives/Forms/Control';
import { ClickableIcon } from './styles';
import Toggle from 'old-components/Guilds/common/Form/Toggle';
import styled, { css } from 'styled-components';
import TokenPicker from 'old-components/Guilds/TokenPicker';
import { ParsedDataInterface, ValidationsInterface } from './types';
import { BigNumber } from 'ethers';

const StyledTokenAmount = styled(TokenAmountInput)`
  ${({ disabled }) =>
    disabled &&
    css`
      color: ${({ theme }) => theme.colors.proposalText.grey} !important;
    `}
`;

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 1rem;
`;

const ToggleLabel = styled.div`
  white-space: nowrap;
  margin-left: 1rem;

  ${({ selected }) =>
    !selected &&
    css`
      color: ${({ theme }) => theme.colors.proposalText.grey} !important;
    `}
`;

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
  setAsset: (asset: string) => void;
  customToAddress: string;
  handleCustomAddress: (value: string) => void;
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
  setAsset,
  customToAddress,
  handleCustomAddress,
}) => {
  const [isTokenPickerOpen, setIsTokenPickerOpen] = useState(false);

  return (
    <div>
      <Control>
        <ControlLabel>Asset</ControlLabel>
        <ControlRow onClick={() => setIsTokenPickerOpen(true)}>
          <Input
            name="asset"
            value={tokenInfo?.symbol || ''}
            placeholder="Token"
            icon={
              <div>
                {parsedData?.asset && (
                  <Avatar
                    src={resolveUri(token?.logoURI)}
                    defaultSeed={parsedData?.asset}
                    size={18}
                  />
                )}
              </div>
            }
            iconRight={<FiChevronDown size={24} />}
            readOnly
          />
        </ControlRow>
        {/* //! There's a bug while showing the token picker: it doesn't dissappear when clicked outside  */}
        <TokenPicker
          walletAddress={parsedData?.to || ''} //? see token picker
          isOpen={isTokenPickerOpen}
          onClose={() => setIsTokenPickerOpen(false)}
          onSelect={asset => {
            setAsset(asset);
            setIsTokenPickerOpen(false);
          }}
        />
      </Control>

      <Control>
        <ControlLabel>To address</ControlLabel>
        <ControlRow>
          <Input
            name="to-address"
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
            onChange={e => handleCustomAddress(e.target.value)}
          />
        </ControlRow>
      </Control>
      <Control>
        <ControlLabel>Amount</ControlLabel>
        <ControlRow>
          <StyledTokenAmount
            name="amount"
            decimals={tokenInfo?.decimals}
            value={customAmountValue}
            onChange={handleTokenAmountInputChange}
            disabled={maxValueToggled}
          />
          <ToggleWrapper>
            <Toggle
              name="toggle-max-value"
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
