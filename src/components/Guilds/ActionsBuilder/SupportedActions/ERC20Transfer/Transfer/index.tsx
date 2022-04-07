import styled from 'styled-components';
import Input from 'components/Guilds/common/Form/Input';
import { FiChevronDown, FiMoreHorizontal, FiX } from 'react-icons/fi';
import { DetailWrapper } from '../../common/editor';
import Avatar from 'components/Guilds/Avatar';
import { resolveUri } from 'utils/url';
import { useWeb3React } from '@web3-react/core';
import { useTokenList } from 'hooks/Guilds/tokens/useTokenList';
import { useMemo, useState } from 'react';
import { ActionEditorProps } from '../..';
import { BigNumber, utils } from 'ethers';
import { useERC20Info } from 'hooks/Guilds/ether-swr/erc20/useERC20Info';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import TokenPicker from 'components/Guilds/TokenPicker';
import { Box } from 'components/Guilds/common/Layout';
import { Button } from 'components/Guilds/common/Button';
import { MAINNET_ID } from 'utils';
import NumericalInput from 'components/Guilds/common/Form/NumericalInput';

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

const Spacer = styled(Box)`
  margin-right: 1rem;
`;

const MenuButton = styled(Button).attrs(() => ({
  variant: 'secondary',
}))`
  border-radius: 50%;
  height: 2.7rem;
  width: 2.7rem;
  padding: 0;
  margin: 0;
`;

const ClickableIcon = styled(Box)`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const TransferAmountInput = styled(NumericalInput)`
  display: flex;
  align-items: center;
  width: 100%;
  &:hover,
  &:focus {
    border: 0.1rem solid ${({ theme }) => theme.colors.text};
  }
`;

interface TransferState {
  source: string;
  tokenAddress: string;
  amount: BigNumber;
  destination: string;
}

const Transfer: React.FC<ActionEditorProps> = ({ call, updateCall }) => {
  const [isTokenPickerOpen, setIsTokenPickerOpen] = useState(false);

  const { chainId } = useWeb3React();

  // parse transfer state from calls
  const parsedData = useMemo<TransferState>(() => {
    if (!call) return null;

    return {
      source: call.from,
      tokenAddress: call.to,
      amount: call.args._value,
      destination: call.args._to,
    };
  }, [call]);

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
  const roundedBalance = useBigNumberToNumber(
    parsedData?.amount,
    tokenInfo?.decimals,
    10
  );
  const { imageUrl: destinationAvatarUrl } = useENSAvatar(
    parsedData?.destination,
    MAINNET_ID
  );

  const setTransferAddress = (walletAddress: string) => {
    updateCall({
      ...call,
      args: {
        ...call.args,
        _to: walletAddress,
      },
    });
  };

  const setToken = (tokenAddress: string) => {
    updateCall({
      ...call,
      to: tokenAddress,
    });
  };

  const setAmount = (value: string) => {
    const amount = value
      ? utils.parseUnits(value, tokenInfo?.decimals || 18)
      : null;
    updateCall({
      ...call,
      args: {
        ...call.args,
        _value: amount,
      },
    });
  };

  return (
    <DetailWrapper>
      <Control>
        <ControlLabel>Recipient</ControlLabel>
        <ControlRow>
          <Input
            value={parsedData.destination}
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
          <Spacer />
          <div>
            <MenuButton>
              <FiMoreHorizontal size={24} />
            </MenuButton>
          </div>
        </ControlRow>
      </Control>

      <ControlRow>
        <Control>
          <ControlLabel>Asset</ControlLabel>
          <ControlRow onClick={() => setIsTokenPickerOpen(true)}>
            <Input
              value={tokenInfo?.symbol}
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

        <Spacer />

        <Control>
          <ControlLabel>Amount</ControlLabel>
          <ControlRow>
            <TransferAmountInput
              value={roundedBalance}
              onUserInput={setAmount}
            />
            <Spacer />
            <div>
              <MenuButton>
                <FiMoreHorizontal size={24} />
              </MenuButton>
            </div>
          </ControlRow>
        </Control>
      </ControlRow>

      <TokenPicker
        walletAddress={parsedData?.source}
        isOpen={isTokenPickerOpen}
        onClose={() => setIsTokenPickerOpen(false)}
        onSelect={tokenAddress => {
          setToken(tokenAddress);
          setIsTokenPickerOpen(false);
        }}
      />
    </DetailWrapper>
  );
};

export default Transfer;
