import React, { useState } from 'react';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import styled from 'styled-components';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import { Button } from '../common/Button';
import { Flex } from '../common/Layout';
import { ContainerText } from '../common/Layout/Text';
import { useHistory, useLocation } from 'react-router-dom';

import { Heading } from '../common/Typography';
import StyledIcon from '../common/SVG';
import { isMobile } from 'react-device-detect';

const Backdrop = styled(Flex)``;
const CloseIcon = styled(FiX)`
  color: ${({ theme }) => theme.colors.text};
  height: 1.5rem;
  width: 1.5rem;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

const Wrapper = styled(Flex)`
  max-width: 386px;
  @media only screen and (max-width: 768px) {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1000;
  }
`;
const Container = styled(Flex)`
  border: 1px solid ${({ theme }) => theme.colors.primary};
  margin: 10px 0;
  width: 100%;

  @media only screen and (max-width: 768px) {
    width: 90%;
  }
`;

const PaddingWrapper = styled(Flex)`
  margin: 24px;
  width: 100%;
`;

const ContentWrapper = styled(Flex)`
  height: 100%;
  justify-content: flex-start;
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

  @media only screen and (max-width: 768px) {
    border-top: 1px solid black;
    justify-content: center;
    align-items: center;
    border-radius: 0;
    padding: 20px;
  }
`;

const ButtonFooter = styled(Button)`
  @media only screen and (max-width: 768px) {
    width: 90%;
  }
`;

const Header = styled(Flex)`
  align-items: flex-start;
  width: 100%;

  @media only screen and (max-width: 768px) {
    border-radius: 0;
    border-bottom: 1px solid black;
    flex-direction: row;
    justify-content: space-between;
    padding: 20px;
    width: 90%;
  }
`;

const HeaderWrap = styled(Flex)`
  flex-direction: row;
`;

const TitleWrapper = styled(Flex)`
  width: 100%;
  align-items: flex-start;
  margin-top: 10px;

  @media only screen and (max-width: 768px) {
    width: 90%;
  }
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
          {onChainAction ? 'On-chain Action' : 'No on-chain action'}
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
  const location = useLocation();

  const continueUrl = location.pathname.replace(
    '/proposalType',
    '/create/proposal_type'
  );

  const [proposalDescription, setProposalDescription] =
    useState<ProposalTypeDescriptionProps>(data[0]);

  return (
    <Backdrop>
      <Wrapper>
        {!isMobile && (
          <Header>
            <Button onClick={() => history.push('/')}>
              <StyledIcon margin="0 10px 0 0" src={AiOutlineArrowLeft} />
              Back to overview
            </Button>
          </Header>
        )}
        {isMobile && (
          <>
            <Header onClick={() => history.push('/')}>
              <HeaderWrap>
                <StyledIcon src={FiArrowLeft} />
                Back to overview
              </HeaderWrap>
              <StyledIcon src={CloseIcon} />
            </Header>
          </>
        )}
        <ContentWrapper>
          <TitleWrapper>
            <Heading size={2}>Create Proposal</Heading>
          </TitleWrapper>
          <Container>
            <PaddingWrapper data-testid="proposal-types-list">
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
            data-testId="proposal-type-description"
          />
        </ContentWrapper>
        <Footer>
          <ButtonFooter
            variant="secondary"
            onClick={() => history.push(continueUrl)}
            data-testid="proposal-type-continue-button"
          >
            Continue
          </ButtonFooter>
        </Footer>
      </Wrapper>
    </Backdrop>
  );
};

export default ProposalTypes;
