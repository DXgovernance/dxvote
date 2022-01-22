import React from 'react';
import { AiOutlineArrowLeft, AiOutlinePlus } from 'react-icons/ai';
import { ImPencil } from 'react-icons/im';
import { MdCreditCard } from 'react-icons/md';
import styled from 'styled-components';
import { Button } from '../common/Button';
import { Flex } from '../common/Layout';
import { ContainerText } from '../common/Layout/Text';
import { useHistory } from 'react-router-dom';

import { ReactComponent as Vector } from '../../../assets/images/vector.svg';
import { ReactComponent as Signal } from '../../../assets/images/signal.svg';
import { Heading } from '../common/Typography';

const Wrapper = styled(Flex)`
  width: 386px;
`;

const Container = styled(Flex)`
  border: 1px solid ${({ theme }) => theme.colors.primary};
  margin: 10px 0;
  width: 100%;
`;

const PaddingWrapper = styled(Flex)`
  margin: 24px;
  width: 362px;
`;

const ProposalTypeButton = styled(Button)`
  width: 90%;
  height: 40px;
  margin: 6px 0;
  flex-direction: row;
  justify-content: left;
`;

const ContainerHeader = styled(Flex)`
  width: 90%;
  justify-content: initial;
  flex-direction: row;
  margin: 6px 0;
`;

const Footer = styled(Flex)`
  flex-direction: row;
  justify-content: right;
  width: 100%;
`;

type StyledIconProps = {
  src: React.FC<React.SVGProps<SVGSVGElement>>;
};

const StyledIconWrapper = styled.div<StyledIconProps>`
  margin: 0 8px;
  & svg {
    & path {
      fill: currentColor;
    }
  }
`;

export const StyledIcon = React.memo((props: StyledIconProps) => {
  const { src, ...rest } = props;

  const Icon = src;

  return (
    <StyledIconWrapper {...rest}>
      <Icon />
    </StyledIconWrapper>
  );
});

const ProposalTypeDescription: React.FC = () => {
  return (
    <Container>
      <PaddingWrapper>
        <ContainerText variant="bold">Signal Proposal</ContainerText>
        <ContainerText variant="medium">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed leo quam,
          blandit eu sapien eu, commodo dapibus nisl.
        </ContainerText>
        <ContainerText variant="medium" color="grey">
          No on-chain action
        </ContainerText>
      </PaddingWrapper>
    </Container>
  );
};

const Header = styled(Flex)`
  align-items: flex-start;
  width: 100%;
`;

const ProposalTypes: React.FC = () => {
  const history = useHistory();
  // @TODO replace onlick in continue button to redirect to create a proposals page

  return (
    <Flex>
      <Wrapper>
        <Header>
          <Button onClick={() => history.push('/')}>
            <StyledIcon src={AiOutlineArrowLeft} />
            Back to overview
          </Button>
          <Heading size={2}>Create Proposal</Heading>
        </Header>
        <Container>
          <PaddingWrapper>
            <ContainerHeader>Choose Proposal</ContainerHeader>
            <ProposalTypeButton>
              <StyledIcon src={Signal} />
              Signal
            </ProposalTypeButton>
            <ProposalTypeButton>
              <StyledIcon src={Vector} />
              Transfer Funds
            </ProposalTypeButton>
            <ProposalTypeButton>
              <StyledIcon src={MdCreditCard} />
              Contributer Payment
            </ProposalTypeButton>
            <ProposalTypeButton>
              <StyledIcon src={AiOutlinePlus} />
              Mint Reputation
            </ProposalTypeButton>
            <ProposalTypeButton>
              <StyledIcon src={ImPencil} />
              Custom Proposal
            </ProposalTypeButton>
          </PaddingWrapper>
        </Container>
        <ProposalTypeDescription />
        <Footer>
          <Button variant="secondary" onClick={() => history.push('/')}>
            Continue
          </Button>
        </Footer>
      </Wrapper>
    </Flex>
  );
};

export default ProposalTypes;
