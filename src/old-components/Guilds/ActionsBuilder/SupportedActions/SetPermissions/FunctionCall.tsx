import {
  Control,
  ControlLabel,
  ControlRow,
} from 'Components/Primitives/Forms/Control';
import Input from 'old-components/Guilds/common/Form/Input';
import Avatar from 'old-components/Guilds/Avatar';
import { ClickableIcon } from './styles';
import { FiX } from 'react-icons/fi';

function FunctionCall({
  validations,
  destinationAvatarUrl,
  parsedData,
  setTransferAddress,
}) {
  return (
    <div>
      Function call permissions
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
        <ControlLabel>Function signature</ControlLabel>
        <ControlRow>
          <Input
            value={''}
            placeholder="Function signature"
            onChange={() => console.log('change function signature input')}
          />
        </ControlRow>
      </Control>
    </div>
  );
}

export default FunctionCall;
