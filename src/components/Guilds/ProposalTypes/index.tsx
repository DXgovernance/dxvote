import React, { useState } from 'react';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import styled from 'styled-components';
import { Button } from '../common/Button';
import { Flex } from '../common/Layout';
import { ContainerText } from '../common/Layout/Text';
import { useHistory } from 'react-router-dom';

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

const Header = styled(Flex)`
  align-items: flex-start;
  width: 100%;
`;

interface ProposalTypeDescriptionProps {
  title: string;
  description: string;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  onChainAction: boolean;
}

const ProposalTypeDescription: React.FC<ProposalTypeDescriptionProps> = ({
  description,
  title,
  onChainAction,
}) => {
  return (
    <Container>
      <PaddingWrapper>
        <ContainerText variant="bold">{title}</ContainerText>
        <ContainerText variant="medium">{description}</ContainerText>
        <ContainerText variant="medium" color="grey">
          {onChainAction ? 'on-chain Action' : 'No on-chain action'}
        </ContainerText>
      </PaddingWrapper>
    </Container>
  );
};

interface ProposalTypesProps {
  data: ProposalTypeDescriptionProps[];
}
const ProposalTypes: React.FC<ProposalTypesProps> = ({ data }) => {
  const history = useHistory();

  const [proposalDescription, setProposalDescription] = useState(data[0]);

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
            {data.map(({ title, description, onChainAction, icon }) => (
              <ProposalTypeButton
                onClick={() =>
                  setProposalDescription({
                    title: title,
                    description: description,
                    onChainAction: onChainAction,
                  })
                }
              >
                <StyledIcon src={icon} />
                {title}
              </ProposalTypeButton>
            ))}
          </PaddingWrapper>
        </Container>
        <ProposalTypeDescription
          title={proposalDescription.title}
          description={proposalDescription.description}
          onChainAction={proposalDescription.onChainAction}
        />
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
