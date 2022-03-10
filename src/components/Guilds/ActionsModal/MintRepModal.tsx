import styled from 'styled-components';
import { Input } from '../../../components/Guilds/common/Form';
import { useWeb3React } from '@web3-react/core';
import { useState } from 'react';

//icons
import arbitrumIcon from '../../../assets/images/arbitrum.png';
import ethereumIcon from '../../../assets/images/ethereum.svg';
import gnosisIcon from '../../../assets/images/gnosis-icon-green.svg';
import { Flex } from '../common/Layout';
import { ContainerText } from '../common/Layout/Text';

const RepWrapper = styled(Flex)`
  margin: 16px auto;
`;
const WrapperText = styled(ContainerText)`
  justify-content: left;
  flex-direction: row;
  width: 85%;
  margin: 8px auto;
`;

const ExternalWrapper = styled(Flex)`
  width: 100%;
  margin: 8px auto;
`;

const MintReputationModal: React.FC = () => {
  const [address, setAddress] = useState('');
  const [repAmount, setRepAmount] = useState('');
  const [repPercent, setRepPercent] = useState('');
  const { chainId } = useWeb3React();

  const iconsByChain = {
    1: ethereumIcon,
    4: ethereumIcon,
    100: gnosisIcon,
    42161: arbitrumIcon,
    421611: arbitrumIcon,
    1337: ethereumIcon,
  };

  return (
    <RepWrapper>
      <ExternalWrapper>
        <WrapperText variant="bold" color="grey">
          Recipient
        </WrapperText>
        <Input
          placeholder="Ethereum Address"
          value={address}
          onChange={e => setAddress(e.target.value)}
          icon={iconsByChain[chainId] || null}
          size={24}
          cross
          width="85%"
        />
      </ExternalWrapper>
      <ExternalWrapper>
        <WrapperText variant="bold" color="grey">
          Reputation Amount
        </WrapperText>
        <Input
          placeholder="0.00"
          value={repAmount}
          onChange={e => setRepAmount(e.target.value)}
          size={24}
          cross
          width="85%"
        />
      </ExternalWrapper>
      <ExternalWrapper>
        <WrapperText variant="bold" color="grey">
          Reputation in %
        </WrapperText>
        <Input
          placeholder="0.00"
          value={repPercent}
          onChange={e => setRepPercent(e.target.value)}
          cross
          width="85%"
        />
      </ExternalWrapper>
    </RepWrapper>
  );
};

export default MintReputationModal;
