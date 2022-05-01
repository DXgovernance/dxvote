import styled from 'styled-components';
import Input from 'components/Guilds/common/Form/Input';
import Avatar from 'components/Guilds/Avatar';
import React, { useEffect } from 'react';
import { ActionEditorProps } from '..';
import { ethers } from 'ethers';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { Box } from 'components/Guilds/common/Layout';
import { shortenAddress, MAINNET_ID } from 'utils';
import { ReactComponent as Info } from '../../../../../assets/images/info.svg';
import StyledIcon from 'components/Guilds/common/SVG';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import { useState } from 'react';
import NumericalInput from 'components/Guilds/common/Form/NumericalInput';
import { useTotalSupply } from 'hooks/Guilds/guild/useTotalSupply';
import { useTokenData } from 'hooks/Guilds/guild/useTokenData';
import { useContractRegistry } from 'hooks/Guilds/contracts/useContractRegistry';
import { StyledToolTip } from 'components/common/ToolTip';
// import { useWeb3React } from '@web3-react/core';

const Control = styled(Box)`
  display: flex;
  flex-direction: column;
  margin: 0.75rem 0;
  width: 100%;
`;

const ControlLabel = styled(Box)`
  display: flex;
  flex-direction: row;
  margin-bottom: 0.75rem;
  color: ${({ theme }) => theme.colors.proposalText.grey};
  font-size: ${({ theme }) => theme.fontSizes.body};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
`;

const ControlRow = styled(Box)`
  display: flex;
  align-items: stretch;
  height: 100%;
`;

const RepMintInput = styled(NumericalInput)`
  display: flex;
  align-items: center;
  width: 100%;
`;

const StyledInfoIcon = styled(StyledIcon)`
  &:hover + ${StyledToolTip} {
    visibility: visible;
  }
  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Mint: React.FC<ActionEditorProps> = ({ decodedCall, updateCall }) => {
  // parse transfer state from calls
  const [repPercent, setRepPercent] = useState(0);
  const [repAmount, setRepAmount] = useState(0);
  const { parsedData } = useTotalSupply({ decodedCall });
  const { tokenData } = useTokenData();

  const totalSupply = useBigNumberToNumber(tokenData?.totalSupply, 18);

  const { imageUrl } = useENSAvatar(parsedData?.toAddress, MAINNET_ID);
  // const { chainId } = useWeb3React()
  const { contracts } = useContractRegistry(42161);
  const contractParams = contracts?.[0]?.functions?.[0].params;
  console.log(contracts);
  console.log(contractParams);
  const setCallDataAmount = (value: string) => {
    const amount = value ? ethers.utils.parseUnits(value) : null;
    updateCall({
      ...decodedCall,
      args: {
        ...decodedCall.args,
        amount,
      },
    });
  };

  useEffect(() => {
    setRepAmount((repPercent / 100) * totalSupply);
    if (repAmount) {
      setCallDataAmount(repAmount.toString());
    }
  }, [repPercent, repAmount, totalSupply]);

  const handleRepChange = (e: number) => {
    if (e) {
      setRepPercent(e);
    }
  };
  return (
    <React.Fragment>
      <Control>
        <ControlLabel>
          Recipient
          <StyledInfoIcon src={Info} />
          <StyledToolTip>
            {contracts.length > 0
              ? contractParams.find(
                  param =>
                    param.component === 'address' &&
                    param.name === 'beneficiary'
                )?.description
              : null}
          </StyledToolTip>
        </ControlLabel>
        <ControlRow>
          <Input
            value={shortenAddress(parsedData?.toAddress)}
            icon={
              <Avatar
                src={imageUrl}
                defaultSeed={parsedData?.toAddress}
                size={18}
              />
            }
            readOnly
          />
        </ControlRow>
      </Control>
      <ControlRow>
        <Control>
          <ControlLabel>
            Reputation in %
            <StyledInfoIcon src={Info} />
            <StyledToolTip>
              {contracts.length > 0
                ? contractParams.find(
                    param =>
                      param.component === 'address' &&
                      param.name === 'beneficiary'
                  )?.description
                : null}
            </StyledToolTip>
          </ControlLabel>
          <ControlRow>
            <RepMintInput value={repPercent} onChange={handleRepChange} />
          </ControlRow>
        </Control>
      </ControlRow>
      <ControlRow>
        <Control>
          <ControlLabel>
            Reputation Amount
            <StyledInfoIcon src={Info} />
            <StyledToolTip>
              {contracts.length > 0
                ? contractParams.find(
                    param =>
                      param.component === 'tokenAmount' &&
                      param.name === 'value'
                  )?.description
                : null}{' '}
            </StyledToolTip>
          </ControlLabel>
          <ControlRow>
            <RepMintInput
              value={repAmount}
              onChange={handleRepChange}
              readOnly
            />
          </ControlRow>
        </Control>
      </ControlRow>
    </React.Fragment>
  );
};

export default Mint;
