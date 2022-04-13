import styled from 'styled-components';
import { Input } from 'components/Guilds/common/Form/Input';
import Avatar from 'components/Guilds/Avatar';
import { useEffect, useMemo } from 'react';
import { ActionEditorProps } from '..';
import { BigNumber, ethers } from 'ethers';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { Box } from 'components/Guilds/common/Layout';
import { shortenAddress, MAINNET_ID } from 'utils';
import { baseInputStyles } from 'components/Guilds/common/Form/Input';
import { ReactComponent as Info } from '../../../../../assets/images/info.svg';
import StyledIcon from 'components/Guilds/common/SVG';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import { useState } from 'react';
import { useERC20Info } from 'hooks/Guilds/ether-swr/erc20/useERC20Info';
import { useGuildConfig } from 'hooks/Guilds/ether-swr/guild/useGuildConfig';
import { useParams } from 'react-router-dom';
import NumericalInput from 'components/Guilds/common/Form/NumericalInput';

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
  ${baseInputStyles}
  display: flex;
  align-items: center;
  width: 100%;
  &:hover,
  &:focus {
    border: 0.1rem solid ${({ theme }) => theme.colors.text};
  }
`;

interface REPMintState {
  toAddress: string;
  amount: BigNumber;
}

const Mint: React.FC<ActionEditorProps> = ({ decodedCall, updateCall }) => {
  // parse transfer state from calls
  const [repPercent, setRepPercent] = useState(0);
  const [repAmount, setRepAmount] = useState(0);
  const { guild_id: guildId } =
    useParams<{ chain_name?: string; guild_id?: string }>();
  const { data } = useGuildConfig(guildId);
  const { data: tokenData } = useERC20Info(data?.token);
  const totalSupply = useBigNumberToNumber(tokenData?.totalSupply, 18);

  const parsedData = useMemo<REPMintState>(() => {
    if (!decodedCall) return null;
    return {
      toAddress: decodedCall.args.to,
      amount: decodedCall.args.amount,
    };
  }, [decodedCall]);

  const { imageUrl } = useENSAvatar(parsedData?.toAddress, MAINNET_ID);

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
    <div>
      <Control>
        <ControlLabel>
          Recipient
          <StyledIcon src={Info} />
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
            Reputation in % <StyledIcon src={Info} />
          </ControlLabel>
          <ControlRow>
            <RepMintInput value={repPercent} onUserInput={handleRepChange} />
          </ControlRow>
        </Control>
      </ControlRow>
      <ControlRow>
        <Control>
          <ControlLabel>
            Reputation Amount <StyledIcon src={Info} />
          </ControlLabel>
          <ControlRow>
            <RepMintInput
              value={repAmount}
              onUserInput={handleRepChange}
              readOnly
            />
          </ControlRow>
        </Control>
      </ControlRow>
    </div>
  );
};

export default Mint;
