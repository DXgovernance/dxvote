import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, utils } from 'ethers';
import { MAINNET_ID } from 'utils';
import { resolveUri } from 'utils/url';
import { ActionEditorProps } from '..';
import { useERC20Info } from 'hooks/Guilds/ether-swr/erc20/useERC20Info';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { useTokenList } from 'hooks/Guilds/tokens/useTokenList';
import { Box } from 'Components/Primitives/Layout';
import Input from 'old-components/Guilds/common/Form/Input';
import Avatar from 'old-components/Guilds/Avatar';
import TokenAmountInput from 'old-components/Guilds/common/Form/TokenAmountInput';
import TokenPicker from 'old-components/Guilds/TokenPicker';
import { Button } from 'old-components/Guilds/common/Button';
import { FiChevronDown, FiX } from 'react-icons/fi';

const Control = styled(Box)`
  display: flex;
  flex-direction: column;
  margin: 0.75rem 0;
  width: 100%;
`;

const ControlLabel = styled(Box)`
  margin-bottom: 0.75rem;
`;

const ControlRow = styled(Box)`
  display: flex;
  align-items: stretch;
  height: 100%;
`;

const ClickableIcon = styled(Box)`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Spacer = styled(Box)`
  margin-right: 1rem;
`;

const OneLineButton = styled(Button)`
  white-space: nowrap;
`;

interface PermissionState {
  source: string;
  tokenAddress: string;
  destination: string;
  amount: BigNumber;
  functionSignature: string;
}

const Permissions: React.FC<ActionEditorProps> = ({
  decodedCall,
  updateCall,
}) => {
  const [isTokenPickerOpen, setIsTokenPickerOpen] = useState(false);

  const { chainId } = useWeb3React();

  // Decoded call: decode information while reading
  // parse transfer state from calls
  //! Refactor inputs when decoded call is implemented
  // ! Most likely wrong. Added just to deploy the component
  const parsedData = useMemo<PermissionState>(() => {
    if (!decodedCall) return null;
    return {
      source: decodedCall.from, // ?
      tokenAddress: decodedCall.to,
      destination: decodedCall.args._to,
      amount: decodedCall.args._value,
      functionSignature: decodedCall.args._functionSignature,
    };
  }, [decodedCall]);

  const validations = useMemo(() => {
    return {
      tokenAddress: utils.isAddress(parsedData?.tokenAddress),
      amount: BigNumber.isBigNumber(parsedData?.amount),
      destination: utils.isAddress(parsedData?.destination),
    };
  }, [parsedData]);

  // Get token details from the token address
  const { tokens } = useTokenList(chainId);
  const token = useMemo(() => {
    if (!parsedData?.tokenAddress || !tokens) return null;

    return tokens.find(({ address }) => address === parsedData.tokenAddress);
  }, [tokens, parsedData]);

  const { data: tokenInfo } = useERC20Info(parsedData?.tokenAddress);
  const { imageUrl: destinationAvatarUrl } = useENSAvatar(
    parsedData?.destination,
    MAINNET_ID
  );

  const setTransferAddress = (walletAddress: string) => {
    updateCall({
      ...decodedCall,
      args: {
        ...decodedCall.args,
        _to: walletAddress,
      },
    });
  };

  const setToken = (tokenAddress: string) => {
    updateCall({
      ...decodedCall,
      to: tokenAddress,
    });
  };

  const setAmount = (value: BigNumber) => {
    updateCall({
      ...decodedCall,
      args: {
        ...decodedCall.args,
        _value: value,
      },
    });
  };

  return (
    <div>
      Asset transfer permissions
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
          <Spacer />
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
      Function calls permissions
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
      <TokenPicker
        walletAddress={parsedData?.source || ''}
        isOpen={isTokenPickerOpen}
        onClose={() => setIsTokenPickerOpen(false)}
        onSelect={tokenAddress => {
          setToken(tokenAddress);
          setIsTokenPickerOpen(false);
        }}
      />
    </div>
  );
};

export default Permissions;
