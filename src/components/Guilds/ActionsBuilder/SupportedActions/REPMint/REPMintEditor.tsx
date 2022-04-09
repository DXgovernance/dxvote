import styled from 'styled-components';
import { Input } from 'components/Guilds/common/Form/Input';
import { FiX } from 'react-icons/fi';
import Avatar from 'components/Guilds/Avatar';
import { useWeb3React } from '@web3-react/core';
import { useTokenList } from 'hooks/Guilds/tokens/useTokenList';
import { useMemo } from 'react';
import { ActionEditorProps } from '..';
import { BigNumber, utils } from 'ethers';
import { useERC20Info } from 'hooks/Guilds/ether-swr/erc20/useERC20Info';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { Box } from 'components/Guilds/common/Layout';
import { MAINNET_ID, shortenAddress } from 'utils';
import NumericalInput from 'components/Guilds/common/Form/NumericalInput';
import { baseInputStyles } from 'components/Guilds/common/Form/Input';
import { ReactComponent as Info } from '../../../../../assets/images/info.svg';
import StyledIcon from 'components/Guilds/common/SVG';

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

const ClickableIcon = styled(Box)`
  display: flex;
  align-items: center;
  cursor: pointer;
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

interface TransferState {
  source: string;
  tokenAddress: string;
  amount: BigNumber;
  destination: string;
}

const Mint: React.FC<ActionEditorProps> = ({ decodedCall, updateCall }) => {
  const { chainId } = useWeb3React();

  // parse transfer state from calls
  const parsedData = useMemo<TransferState>(() => {
    if (!decodedCall) return null;

    return {
      source: decodedCall.from,
      tokenAddress: decodedCall.to,
      amount: decodedCall.args._value,
      destination: decodedCall.args._to,
    };
  }, [decodedCall]);

  const validations = useMemo(() => {
    return {
      tokenAddress: utils.isAddress(parsedData?.tokenAddress),
      amount: BigNumber.isBigNumber(parsedData?.amount),
      destination: utils.isAddress(parsedData?.destination),
    };
  }, [parsedData]);

  // // Get token details from the token address
  const { tokens } = useTokenList(chainId);
  const token = useMemo(() => {
    if (!parsedData?.tokenAddress || !tokens) return null;

    return tokens.find(({ address }) => address === parsedData.tokenAddress);
  }, [tokens, parsedData]);
  console.log(token);

  const { data: tokenInfo } = useERC20Info(parsedData?.tokenAddress);
  const roundedBalance = useBigNumberToNumber(
    parsedData?.amount,
    tokenInfo?.decimals,
    10
  );
  const { ensName, imageUrl: destinationAvatarUrl } = useENSAvatar(
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

  const setAmount = (value: string) => {
    const amount = value
      ? utils.parseUnits(value, tokenInfo?.decimals || 18)
      : null;
    updateCall({
      ...decodedCall,
      args: {
        ...decodedCall.args,
        _value: amount,
      },
    });
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
            value={parsedData.destination || ''}
            icon={
              <div>
                {validations.destination && (
                  <>
                    <Avatar
                      src={destinationAvatarUrl}
                      defaultSeed={parsedData.destination}
                      size={24}
                    />
                    <span>
                      {ensName || parsedData?.destination
                        ? shortenAddress(parsedData?.destination)
                        : ''}
                    </span>
                  </>
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
            onChange={e => setTransferAddress(e.target.value)}
          />
        </ControlRow>
      </Control>
      <ControlRow>
        <Control>
          <ControlLabel>
            Reputation in % <StyledIcon src={Info} />
          </ControlLabel>
          <ControlRow>
            <RepMintInput value={roundedBalance} onUserInput={setAmount} />
          </ControlRow>
        </Control>
      </ControlRow>
      <ControlRow>
        <Control>
          <ControlLabel>
            Reputation Amount <StyledIcon src={Info} />
          </ControlLabel>
          <ControlRow>
            <RepMintInput value={roundedBalance} onUserInput={setAmount} />
          </ControlRow>
        </Control>
      </ControlRow>
    </div>
  );
};

export default Mint;
