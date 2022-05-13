import { useMemo, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, utils } from 'ethers';
import { MAINNET_ID } from 'utils';
import { ActionEditorProps } from '..';
import { useERC20Info } from 'hooks/Guilds/ether-swr/erc20/useERC20Info';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { useTokenList } from 'hooks/Guilds/tokens/useTokenList';
import AssetTransfer from './AssetTransfer';
import FunctionCall from './FunctionCall';
import styled, { css } from 'styled-components';
import { Button } from 'old-components/Guilds/common/Button';
import { Box } from 'Components/Primitives/Layout';
import { MAX_UINT } from 'utils';

const DetailWrapper = styled(Box)`
  margin: 1.25rem 0rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.card.grey}; ;
`;

const TabButton = styled(Button)`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: -1px;
  border-radius: 10px 10px 0px 0px;
  color: ${({ theme }) => theme.colors.proposalText.grey};

  ${({ active }) =>
    active &&
    css`
      border: 2px solid ${({ theme }) => theme.colors.card.grey};
      color: ${({ theme }) => theme.colors.text};
    `}
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
  const [activeTab, setActiveTab] = useState(0);

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

  const setAmount = (value: BigNumber) => {
    updateCall({
      ...decodedCall,
      args: {
        ...decodedCall.args,
        _value: value,
      },
    });
  };

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
  const bigNumberMaxUINT = BigNumber.from(MAX_UINT);
  const handleToggleChange = () => {
    if (!maxValueToggled) setAmount(bigNumberMaxUINT);
    setMaxValueToggled(!maxValueToggled);
  };

  return (
    <div>
      <DetailWrapper>
        <TabButton active={activeTab === 0} onClick={() => setActiveTab(0)}>
          Assets transfer
        </TabButton>
        <TabButton active={activeTab === 1} onClick={() => setActiveTab(1)}>
          Functions call
        </TabButton>
      </DetailWrapper>
      {activeTab === 0 && (
        <AssetTransfer
          updateCall={updateCall}
          decodedCall={decodedCall}
          validations={validations}
          destinationAvatarUrl={destinationAvatarUrl}
          parsedData={parsedData}
          setTransferAddress={setTransferAddress}
          tokenInfo={tokenInfo}
          token={token}
          customAmountValue={customAmountValue}
          handleTokenAmountInputChange={handleTokenAmountInputChange}
          maxValueToggled={maxValueToggled}
          handleToggleChange={handleToggleChange}
        />
      )}
      {activeTab === 1 && (
        <FunctionCall
          validations={validations}
          destinationAvatarUrl={destinationAvatarUrl}
          parsedData={parsedData}
          setTransferAddress={setTransferAddress}
        />
      )}
    </div>
  );
};

export default Permissions;
