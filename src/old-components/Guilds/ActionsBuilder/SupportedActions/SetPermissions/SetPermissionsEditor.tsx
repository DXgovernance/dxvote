import { useEffect, useMemo, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, utils } from 'ethers';
import { ANY_FUNC_SIGNATURE, MAINNET_ID, ZERO_ADDRESS } from 'utils';
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

const Web3 = require('web3');
const web3 = new Web3();

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
    const { functionName } = decodedCall;
    const { asset, to, functionSignature, valueAllowed, allowance } =
      decodedCall.args;

    return {
      asset,
      to,
      functionSignature,
      valueAllowed,
      allowance,
      functionName,
    };
  }, [decodedCall]);

  const validations = useMemo<ValidationsInterface>(() => {
    function isFunctionNameValid(value: string): boolean {
      const regexFunctionName = /(\w+)[(]{1}([a-zA-Z0-9,]*)[)]{1}/g;
      if (!value || value === '') return true;
      if (value.substring(0, 2) === '0x' && value.length === 10) return true;
      if (value.match(regexFunctionName)) return true;

      return false;
    }

    return {
      asset: utils.isAddress(parsedData?.asset[0]),
      to: utils.isAddress(parsedData?.to[0]),
      valueAllowed: BigNumber.isBigNumber(parsedData?.valueAllowed[0]),
      functionName: isFunctionNameValid(parsedData?.functionName),
    };
  }, [parsedData]);

  const [pickedAsset, setPickedAsset] = useState(parsedData?.asset[0]);

  // Get token details from the token address
  const { tokens } = useTokenList(chainId);
  const token = useMemo(() => {
    if (!pickedAsset || !tokens) return null;

    return tokens.find(({ address }) => address === pickedAsset);
  }, [tokens, parsedData]);

  const { data: tokenInfo } = useERC20Info(pickedAsset);
  const { imageUrl: destinationAvatarUrl } = useENSAvatar(
    parsedData?.to[0],
    MAINNET_ID
  );

  //
  // Asset-related functions
  //

  const setAsset = (asset: string) => {
    decodedCall.args.asset = [asset];
    updateCall(decodedCall);
  };
  const handleAssetChange = (asset: string) => {
    setAsset(asset);
    setPickedAsset(asset);
  };
  useEffect(() => {
    if (activeTab === 0) setAsset(pickedAsset);
    if (activeTab === 1) setAsset(ZERO_ADDRESS);
  }, [activeTab]);

  //
  // Function and function signature related functions
  //

  // function signature
  const setFunctionSignature = (value: string) => {
    // If value is empty
    if (!value || value === '') {
      updateCall({
        ...decodedCall,
        functionName: '',
        args: {
          ...decodedCall.args,
          functionSignature: [ANY_FUNC_SIGNATURE],
        },
      });
    }

    // If the value already is encoded
    else if (value.substring(0, 2) === '0x') {
      updateCall({
        ...decodedCall,
        functionName: value,
        args: {
          ...decodedCall.args,
          functionSignature: [value],
        },
      });
    }

    // if the value is the name of the function
    else {
      const functionSignature = web3.eth.abi.encodeFunctionSignature(value);
      updateCall({
        ...decodedCall,
        functionName: value,
        args: {
          ...decodedCall.args,
          functionSignature: [functionSignature],
        },
      });
    }
  };

  // It has two values for functionSignature: a custom one that is set and modified
  // when the input is modified in FunctionCall component
  // and the ANY_FUNC_SIGNATURE that is switched when in AssetTransfer component
  const [customFunctionName, setCustomFunctionName] = useState(
    parsedData?.functionName
  );
  const handleCustomFunctionSignature = value => {
    setCustomFunctionName(value);
    setFunctionSignature(value);
  };
  useEffect(() => {
    if (activeTab === 0) setFunctionSignature(ANY_FUNC_SIGNATURE);
    if (activeTab === 1) setFunctionSignature(customFunctionName);
  }, [activeTab]);

  //
  // Amount related functions
  //

  // valueAllowed
  const setAmount = (valueAllowed: BigNumber) => {
    updateCall({
      ...decodedCall,
      args: {
        ...decodedCall.args,
        valueAllowed: [valueAllowed],
      },
    });
  };

  const [customAmountValue, setCustomAmountValue] = useState(
    parsedData?.valueAllowed[0]
  );
  // This function was implemented to avoid the amount input to
  // change to MAX_UINT toggling to "Max value"
  const handleTokenAmountInputChange = e => {
    setAmount(e);
    setCustomAmountValue(e);
  };

  const [maxValueToggled, setMaxValueToggled] = useState(false);
  const bigNumberMaxUINT = BigNumber.from(MAX_UINT);
  const handleToggleMaxValueChange = () => {
    if (!maxValueToggled) setAmount(bigNumberMaxUINT);
    else setAmount(customAmountValue);
    setMaxValueToggled(!maxValueToggled);
  };

  //
  // To-Address related functions
  //

  const [customToAddress, setCustomToAddress] = useState(parsedData?.to[0]);
  const [anyAddressToggled, setAnyAddressToggled] = useState(
    parsedData?.to[0] === ANY_ADDRESS
  );
  // to address
  const setToAddress = (to: string) => {
    updateCall({
      ...decodedCall,
      args: {
        ...decodedCall.args,
        to: [to],
      },
    });
  };

  const handleToggleAnyAddressChange = () => {
    if (!anyAddressToggled) setToAddress(ANY_ADDRESS);
    else setToAddress(customToAddress);
    setAnyAddressToggled(!anyAddressToggled);
  };

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
    if (parsedData?.to[0] === ANY_ADDRESS) handleCustomAddress('');
  }, []);

  // TODO: Disable clicking on "X" on input address when disabled

  return (
    <div>
      <DetailWrapper>
        <TabButton
          aria-label="assets transfer tab"
          active={activeTab === 0}
          onClick={() => setActiveTab(0)}
        >
          Assets transfer
        </TabButton>
        <TabButton
          aria-label="functions call tab"
          active={activeTab === 1}
          onClick={() => setActiveTab(1)}
        >
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
          handleToggleMaxValueChange={handleToggleMaxValueChange}
          handleAssetChange={handleAssetChange}
          customToAddress={customToAddress}
          handleCustomAddress={handleCustomAddress}
          pickedAsset={pickedAsset}
          anyAddressToggled={anyAddressToggled}
          handleToggleAnyAddressChange={handleToggleAnyAddressChange}
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
          customFunctionName={customFunctionName}
          tokenInfo={tokenInfo}
          customAmountValue={customAmountValue}
          handleTokenAmountInputChange={handleTokenAmountInputChange}
          maxValueToggled={maxValueToggled}
          handleToggleMaxValueChange={handleToggleMaxValueChange}
          setAsset={setAsset}
          anyAddressToggled={anyAddressToggled}
          handleToggleAnyAddressChange={handleToggleAnyAddressChange}
        />
      )}
    </div>
  );
};

export default Permissions;
