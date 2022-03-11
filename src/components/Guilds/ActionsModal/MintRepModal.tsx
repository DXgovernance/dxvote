import styled from 'styled-components';
import { Input } from '../../../components/Guilds/common/Form';
import { useWeb3React } from '@web3-react/core';
import { useState } from 'react';
import { Flex } from '../common/Layout';
import { ContainerText } from '../common/Layout/Text';
import iconsByChain from '../common/ChainIcons';

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
