import styled from 'styled-components';
import { Input, BaseInput } from 'components/Guilds/common/Form/Input';
import { FiChevronDown, FiMoreHorizontal, FiX } from 'react-icons/fi';
import { DetailWrapper } from '../../common/editor';
import Avatar from 'components/Guilds/Avatar';
import { resolveUri } from 'utils/url';
import { useWeb3React } from '@web3-react/core';
import { useTokenList } from 'hooks/Guilds/tokens/useTokenList';
import { useMemo, useState } from 'react';
import { ActionEditorProps } from '../..';
import { BigNumber } from 'ethers';
import { useERC20Info } from 'hooks/Guilds/ether-swr/erc20/useERC20Info';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import TokenPicker from 'components/Guilds/TokenPicker';
import { Box } from 'components/Guilds/common/Layout';
import { Button } from 'components/Guilds/common/Button';
import { MAINNET_ID } from 'utils';
import { useDecodedCall } from 'hooks/Guilds/contracts/useDecodedCall';

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

interface TransferState {
  tokenAddress: string;
  amount: BigNumber;
  source: string;
  destination: string;
}

const Transfer: React.FC<ActionEditorProps> = ({ call, updateCall }) => {
  const [isTokenPickerOpen, setIsTokenPickerOpen] = useState(false);

  const { contract, decodedCall } = useDecodedCall(call);
  const { chainId } = useWeb3React();

  // parse transfer state from calls
  const parsedData = useMemo<TransferState>(() => {
    if (!call || !decodedCall) return null;

    return {
      tokenAddress: call.to,
      amount: BigNumber.from(decodedCall.args._value),
      source: call.from,
      destination: decodedCall.args._to,
    };
  }, [call, decodedCall]);

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
    const encodedData = contract.encodeFunctionData('transfer', [
      walletAddress,
      parsedData?.amount,
    ]);

    updateCall({
      ...call,
      data: encodedData,
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
                <Avatar
                  src={destinationAvatarUrl}
                  defaultSeed={parsedData.destination}
                  size={24}
                />
              </div>
            }
            iconRight={<FiX size={18} />}
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
          <ControlRow>
            <Input
              value={tokenInfo?.symbol}
              icon={
                <div>
                  <Avatar
                    src={resolveUri(token?.logoURI)}
                    defaultSeed={parsedData.tokenAddress}
                    size={18}
                  />
                </div>
              }
              onClick={() => setIsTokenPickerOpen(true)}
              iconRight={<FiChevronDown size={24} />}
              readOnly
            />
          </ControlRow>
        </Control>

        <Spacer />

        <Control>
          <ControlLabel>Amount</ControlLabel>
          <ControlRow>
            <BaseInput value={roundedBalance} />
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
        isOpen={isTokenPickerOpen}
        onClose={() => setIsTokenPickerOpen(false)}
      />
    </DetailWrapper>
  );
};

export default Transfer;
