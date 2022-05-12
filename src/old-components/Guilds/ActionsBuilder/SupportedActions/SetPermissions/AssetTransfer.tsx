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
import { MAX_UINT } from 'utils';
import styled, { css } from 'styled-components';

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

  ${({ selected }) =>
    !selected &&
    css`
      color: ${({ theme }) => theme.colors.proposalText.grey} !important;
    `}
`;

const AssetTransfer = ({
  validations,
  destinationAvatarUrl,
  parsedData,
  setTransferAddress,
  tokenInfo,
  setAmount,
  setIsTokenPickerOpen,
  token,
}) => {
  const [customAmountValue, setCustomAmountValue] = useState(
    parsedData?.amount
  );
  // This function was implemented to avoid the amount input to
  // change to MAX_UINT toggling to "Max value"
  const handleTokenAmountInputChange = e => {
    setAmount(e);
    setCustomAmountValue(e);
  };

  const [maxValueToggled, setMaxValueToggled] = useState(false);
  const handleToggleChange = () => {
    if (!maxValueToggled) setAmount(MAX_UINT);
    setMaxValueToggled(!maxValueToggled);
  };

  return (
    <div>
      <Control>
        <ControlLabel>Recipient</ControlLabel>
        <ControlRow>
          <Input
            value={''}
            icon={
              <div>
                {validations.destination && (
                  <Avatar
                    src={destinationAvatarUrl}
                    defaultSeed={parsedData.destination}
                    size={24}
                  />
                )}
              </div>
            }
            iconRight={
              parsedData?.destination ? (
                <ClickableIcon onClick={() => setTransferAddress('')}>
                  <FiX size={18} />
                </ClickableIcon>
              ) : null
            }
            placeholder="Ethereum address"
            onChange={e => setTransferAddress(e.target.value)}
          />
        </ControlRow>
      </Control>
      <Control>
        <ControlLabel>Amount</ControlLabel>
        <ControlRow>
          <StyledTokenAmount
            decimals={tokenInfo?.decimals}
            value={customAmountValue}
            onChange={handleTokenAmountInputChange}
            disabled={maxValueToggled}
          />
          <ToggleWrapper>
            <ToggleLabel selected={!maxValueToggled}>Custom</ToggleLabel>
            <Toggle value={maxValueToggled} onChange={handleToggleChange} />
            <ToggleLabel selected={maxValueToggled}>Max value</ToggleLabel>
          </ToggleWrapper>
        </ControlRow>
      </Control>
      <Control>
        <ControlLabel>Asset</ControlLabel>
        <ControlRow onClick={() => setIsTokenPickerOpen(true)}>
          <Input
            value={tokenInfo?.symbol || ''}
            placeholder="Token"
            icon={
              <div>
                {parsedData?.tokenAddress && (
                  <Avatar
                    src={resolveUri(token?.logoURI)}
                    defaultSeed={parsedData?.tokenAddress}
                    size={18}
                  />
                )}
              </div>
            }
            iconRight={<FiChevronDown size={24} />}
            readOnly
          />
        </ControlRow>
      </Control>
    </div>
  );
};

export default AssetTransfer;
