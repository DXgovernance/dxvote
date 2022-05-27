import styled from 'styled-components';
import { FiX } from 'react-icons/fi';

import { Button } from 'old-components/Guilds/common/Button';
import { Flex } from 'Components/Primitives/Layout';

export const Backdrop = styled(Flex)``;
export const CloseIcon = styled(FiX)`
  color: ${({ theme }) => theme.colors.text};
  height: 1.5rem;
  width: 1.5rem;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

export const Wrapper = styled(Flex)`
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
export const Container = styled(Flex)`
  border: 1px solid ${({ theme }) => theme.colors.border.initial};
  margin: 10px 0;
  width: 100%;

  @media only screen and (max-width: 768px) {
    width: 90%;
  }
`;

export const PaddingWrapper = styled(Flex)`
  margin: 24px;
  width: 100%;
`;

export const StyledProposalDescription = styled(Flex)`
  display: flex;
  align-items: flex-start;
  margin: 0px 24px;
`;

export const ContentWrapper = styled(Flex)`
  height: 100%;
  justify-content: flex-start;
`;

export const ProposalTypeButton = styled(Button)`
  width: 90%;
  height: 40px;
  margin: 6px 0;
  flex-direction: row;
  justify-content: left;
  &:active,
  &:focus {
    border: 2px solid ${({ theme }) => theme.colors.text};
  }
`;

export const ContainerHeader = styled(Flex)`
  width: 90%;
  justify-content: initial;
  flex-direction: row;
  margin: 6px 0;
  color: ${({ theme }) => theme.colors.proposalText.lightGrey};
`;

export const Footer = styled(Flex)`
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

export const ButtonFooter = styled(Button)`
  @media only screen and (max-width: 768px) {
    width: 90%;
  }
`;

export const Header = styled(Flex)`
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

export const HeaderWrap = styled(Flex)`
  flex-direction: row;
`;

export const TitleWrapper = styled(Flex)`
  width: 100%;
  align-items: flex-start;
  margin-top: 10px;
  color: ${({ theme }) => theme.colors.text};

  @media only screen and (max-width: 768px) {
    width: 90%;
  }
`;
