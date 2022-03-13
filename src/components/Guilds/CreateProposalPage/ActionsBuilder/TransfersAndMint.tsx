import styled from 'styled-components';
import { CardWrapper, Header } from 'components/Guilds/common/Card';
import AddButton from './AddButton';
import { Flex } from 'components/Guilds/common/Layout';
import { ContainerText } from 'components/Guilds/common/Layout/Text';
import { TextInput } from 'components/Guilds/common/Form';
import { useWeb3React } from '@web3-react/core';
import { useState } from 'react';
import iconsByChain from 'components/Guilds/common/ChainIcons';
import CircleDots from '../../../../assets/images/circle.svg';
import StyledIcon from 'components/Guilds/common/SVG';
import NumericalInput from 'components/Guilds/common/Form/NumericalInput';
import {
  DropdownContent,
  DropdownMenu,
  DropdownPosition,
  DropdownButton,
} from '../../common/DropdownMenu';
import { AssetDropDown } from './AssetDropdown';

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
  color: ${({ theme }) => theme.colors.proposalText.grey};
`;

const RecText = styled(WrapperText)`
  width: 95%;
`;

const Segment = styled(Flex)`
  width: 100%;
`;

const HorizontalWrapper = styled(Flex)`
  flex-direction: row;
  width: 100%;
  justify-content: space-evenly;
`;

const Container = styled(Flex)`
  width: 100%;
`;

const MiddleDetailsWrapper = styled(DetailWrapper)`
  border-radius: revert;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.initial};
`;

const RecipientInput: React.FC = () => {
  const [address, setAddress] = useState('');
  const { chainId } = useWeb3React();
  return (
    <MiddleDetailsWrapper>
      <Container>
        <RecText>Recipient</RecText>
        <HorizontalWrapper>
          <Segment>
            <TextInput
              placeholder="Address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              icon={iconsByChain[chainId] || null}
              size={24}
              cross
              width="92%"
            />
          </Segment>
          <StyledIcon src={CircleDots} margin="0" />
        </HorizontalWrapper>
      </Container>

      <HorizontalWrapper>
        <Container>
          <WrapperText>Amount</WrapperText>
          <Segment>
            <NumericalInput
              onUserInput={e => setAddress(e)}
              placeholder="0.00"
              value={address}
              width="85%"
            />
          </Segment>
        </Container>

        <Container>
          <WrapperText>Asset</WrapperText>
          <Segment>
            <AssetDropDown />
          </Segment>
        </Container>
        <StyledIcon src={CircleDots} margin="50px 0 0 0" />
      </HorizontalWrapper>
    </MiddleDetailsWrapper>
  );
};

const TransferAndMint: React.FC = () => {
  const [addChild, setAddChild] = useState<number>(1);
  return (
    <CardWrapperWithMargin>
      <CardHeader>Transfer and Mint</CardHeader>
      {[...Array(addChild)].map(_ => (
        <RecipientInput />
      ))}
      <DetailFooter>
        <AddButton
          onClick={() => setAddChild(prevCount => prevCount + 1)}
          label="Add Recipient"
        />
      </DetailFooter>
    </CardWrapperWithMargin>
  );
};

export default TransferAndMint;
