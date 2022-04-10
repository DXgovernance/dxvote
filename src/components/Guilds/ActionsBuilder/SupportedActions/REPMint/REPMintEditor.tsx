/* eslint-disable @typescript-eslint/no-unused-vars */
import styled from 'styled-components';
import { Input } from 'components/Guilds/common/Form/Input';
import Avatar from 'components/Guilds/Avatar';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { ActionEditorProps } from '..';
import { utils } from 'ethers';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { Box } from 'components/Guilds/common/Layout';
import { shortenAddress, MAINNET_ID } from 'utils';
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

// interface REPMintState {
//   source: string;
//   tokenAddress: string;
//   amount: BigNumber;
//   destination: string;
// }

const Mint: React.FC<ActionEditorProps> = ({ decodedCall }) => {
  // parse transfer state from calls
  // const parsedData = useMemo<REPMintState>(() => {
  //   if (!decodedCall) return null;

  //   return {
  //     source: decodedCall.from,
  //     tokenAddress: decodedCall.to,
  //     amount: decodedCall.args._value,
  //     destination: decodedCall.args._to,
  //   };
  // }, [decodedCall]);

  const { account: userAddress } = useWeb3React();
  const { imageUrl } = useENSAvatar(userAddress, MAINNET_ID);

  const validations = useMemo(() => {
    return {
      destination: utils.isAddress(userAddress),
    };
  }, [userAddress]);

  return (
    <div>
      <Control>
        <ControlLabel>
          Recipient
          <StyledIcon src={Info} />
        </ControlLabel>
        <ControlRow>
          <Input
            value={shortenAddress(userAddress)}
            icon={
              validations.destination && (
                <Avatar src={imageUrl} defaultSeed={userAddress} size={18} />
              )
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
            <RepMintInput value={''} onUserInput={''} />
          </ControlRow>
        </Control>
      </ControlRow>
      <ControlRow>
        <Control>
          <ControlLabel>
            Reputation Amount <StyledIcon src={Info} />
          </ControlLabel>
          <ControlRow>
            <RepMintInput value={''} onUserInput={''} />
          </ControlRow>
        </Control>
      </ControlRow>
    </div>
  );
};

export default Mint;
