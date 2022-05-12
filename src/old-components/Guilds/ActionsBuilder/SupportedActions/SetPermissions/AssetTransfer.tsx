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
import { ClickableIcon, OneLineButton } from './styles';

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
          <TokenAmountInput
            decimals={tokenInfo?.decimals}
            value={parsedData?.amount}
            onChange={setAmount}
          />
          <OneLineButton>Max Value</OneLineButton>
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
