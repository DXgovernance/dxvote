import styled from 'styled-components';
import { CardWrapper, Header } from 'components/Guilds/common/Card';
import AddButton from './AddButton';
import { Flex } from 'components/Guilds/common/Layout';
import { ContainerText } from 'components/Guilds/common/Layout/Text';
import { Input } from 'components/Guilds/common/Form';
import { useWeb3React } from '@web3-react/core';
import { useState } from 'react';
import iconsByChain from 'components/Guilds/common/ChainIcons';

const CardWrapperWithMargin = styled(CardWrapper)`
  margin: 1.5rem;
`;

const CardHeader = styled(Header)`
  padding: 0.875rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DetailWrapper = styled(Flex)`
  background: ${({ theme }) => theme.colors.background};
  padding: 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border.initial};
`;

const DetailFooter = styled(DetailWrapper)`
  flex-direction: row;
  justify-content: left;
  border-top: none;
`;

const WrapperText = styled(ContainerText).attrs(() => ({
  variant: 'bold',
}))`
  justify-content: left;
  flex-direction: row;
  width: 90%;
  margin: 12px auto;
`;

const RecText = styled(WrapperText)`
  width: 95%;
`;

const Segment = styled(Flex)`
  width: 100%;
`;

const HorizontalWrapper = styled(Flex)`
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
`;

const Container = styled(Flex)`
  width: 100%;
`;
const MiddleDetailsWrapper = styled(DetailWrapper)`
  border-radius: revert;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.initial};
`;

const TransferAndMint: React.FC = () => {
  const [address, setAddress] = useState('');
  const { chainId } = useWeb3React();
  return (
    <CardWrapperWithMargin>
      <CardHeader>Transfer and Mint</CardHeader>

      <MiddleDetailsWrapper>
        <Container>
          <RecText>Recipient</RecText>
          <Segment>
            <Input
              placeholder="Ethereum Address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              icon={iconsByChain[chainId] || null}
              size={24}
              cross
              width="92%"
            />
          </Segment>
        </Container>

        <HorizontalWrapper>
          <Container>
            <WrapperText>Amount</WrapperText>
            <Segment>
              <Input
                placeholder="Ethereum Address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                icon={iconsByChain[chainId] || null}
                size={24}
                cross
                width="85%"
              />
            </Segment>
          </Container>

          <Container>
            <WrapperText>Asset</WrapperText>
            <Segment>
              <Input
                placeholder="0.00"
                value={address}
                onChange={e => setAddress(e.target.value)}
                width="85%"
              />
            </Segment>
          </Container>
        </HorizontalWrapper>
      </MiddleDetailsWrapper>
      <DetailFooter>
        <AddButton label="Add Recipient" />
      </DetailFooter>
    </CardWrapperWithMargin>
  );
};

export default TransferAndMint;
