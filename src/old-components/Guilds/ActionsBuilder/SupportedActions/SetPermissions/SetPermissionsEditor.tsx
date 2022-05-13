import { useEffect, useMemo, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, utils } from 'ethers';
import { ANY_FUNC_SIGNATURE, MAINNET_ID } from 'utils';
import { ActionEditorProps } from '..';
import { useERC20Info } from 'hooks/Guilds/ether-swr/erc20/useERC20Info';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { useTokenList } from 'hooks/Guilds/tokens/useTokenList';
import AssetTransfer from './AssetTransfer';
import FunctionCall from './FunctionCall';
import styled, { css } from 'styled-components';
import { Button } from 'old-components/Guilds/common/Button';
import { Box } from 'Components/Primitives/Layout';
import { MAX_UINT, ANY_ADDRESS } from 'utils';
import { ParsedDataInterface, ValidationsInterface } from './types';

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

const Permissions: React.FC<ActionEditorProps> = ({
  decodedCall,
  updateCall,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const { chainId } = useWeb3React();

  // parse transfer state from calls
  const parsedData = useMemo<ParsedDataInterface>(() => {
    if (!decodedCall) return null;
    const { asset, to, functionSignature, valueAllowed, allowance } =
      decodedCall.args;
    return {
      asset,
      to,
      functionSignature,
      valueAllowed,
      allowance,
    };
  }, [decodedCall]);

  const validations = useMemo<ValidationsInterface>(() => {
    return {
      asset: utils.isAddress(parsedData?.asset),
      to: utils.isAddress(parsedData?.to),
      valueAllowed: BigNumber.isBigNumber(parsedData?.valueAllowed),
    };
  }, [parsedData]);

  // Get token details from the token address
  const { tokens } = useTokenList(chainId);
  const token = useMemo(() => {
    if (!parsedData?.asset || !tokens) return null;

    return tokens.find(({ address }) => address === parsedData.asset);
  }, [tokens, parsedData]);

  const { data: tokenInfo } = useERC20Info(parsedData?.asset);
  const { imageUrl: destinationAvatarUrl } = useENSAvatar(
    parsedData?.to,
    MAINNET_ID
  );

  // functions to set contract arguments

  // asset
  const setAsset = (asset: string) => {
    updateCall({
      ...decodedCall,
      args: {
        ...decodedCall.args,
        asset,
      },
    });
  };

  // valueAllowed
  const setAmount = (valueAllowed: BigNumber) => {
    updateCall({
      ...decodedCall,
      args: {
        ...decodedCall.args,
        valueAllowed,
      },
    });
  };

  // to address
  const setToAddress = (to: string) => {
    updateCall({
      ...decodedCall,
      args: {
        ...decodedCall.args,
        to,
      },
    });
  };

  // function signature
  const setFunctionSignature = (functionSignature: string) => {
    updateCall({
      ...decodedCall,
      args: {
        ...decodedCall.args,
        functionSignature: functionSignature,
      },
    });
  };

  const [customAmountValue, setCustomAmountValue] = useState(
    parsedData?.valueAllowed
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

  const [customToAddress, setCustomToAddress] = useState(parsedData?.to);
  const handleCustomAddress = value => {
    setCustomToAddress(value);
    if (value === '') {
      setToAddress(ANY_ADDRESS);
    } else {
      setToAddress(value);
    }
  };
  // If the 'to' address is ANY_ADDRESS, set customAmount to '', to
  // show the address input empty, instead of the long 0xAaaAaaa address
  useEffect(() => {
    if (parsedData?.to === ANY_ADDRESS) handleCustomAddress('');
  }, []);

  // It has two values for functionSignature: a custom whan that is set and modified
  // when the input is modified in FunctionCall compoent
  // and the ANY_FUNC_SIGNATURE that is switched when in AssetTransfer component
  const [customFunctionSignature, setCustomFunctionSignature] = useState('');
  const handleCustomFunctionSignature = value => {
    setCustomFunctionSignature(value);
    setFunctionSignature(value);
  };
  useEffect(() => {
    if (activeTab === 0) setFunctionSignature(ANY_FUNC_SIGNATURE);
    if (activeTab === 1) setFunctionSignature(customFunctionSignature);
    console.log('custom: ', customFunctionSignature);
    console.log('called: ', parsedData.functionSignature);
  }, [activeTab]);

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
          validations={validations}
          destinationAvatarUrl={destinationAvatarUrl}
          parsedData={parsedData}
          tokenInfo={tokenInfo}
          token={token}
          customAmountValue={customAmountValue}
          handleTokenAmountInputChange={handleTokenAmountInputChange}
          maxValueToggled={maxValueToggled}
          handleToggleChange={handleToggleChange}
          setAsset={setAsset}
          customToAddress={customToAddress}
          handleCustomAddress={handleCustomAddress}
        />
      )}
      {activeTab === 1 && (
        <FunctionCall
          validations={validations}
          destinationAvatarUrl={destinationAvatarUrl}
          parsedData={parsedData}
          handleCustomFunctionSignature={handleCustomFunctionSignature}
          customToAddress={customToAddress}
          handleCustomAddress={handleCustomAddress}
        />
      )}
    </div>
  );
};

export default Permissions;
