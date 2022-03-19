import React from 'react';
import styled from 'styled-components';
import { Flex } from '../common/Layout';
import { ContainerText } from '../common/Layout/Text';
import { Button } from '../common/Button';
import { ReactComponent as Vector } from '../../../assets/images/vector.svg';
import StyledIcon from '../common/SVG';
import {
  ActionsModalView,
  useActionsBuilder,
} from 'contexts/Guilds/ActionsBuilder';

const CoreWrapper = styled(Flex)`
  width: 100%;
  margin-bottom: 16px;
`;

const ExternalWrapper = styled(Flex)`
  width: 100%;
`;

const Wrapper = styled(Flex)`
  width: 100%;
  margin: 24px auto;
`;

const ActionsButton = styled(Button).attrs(() => ({
  variant: 'secondary',
}))`
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

const WrapperText = styled(ContainerText).attrs(() => ({
  variant: 'bold',
}))`
  justify-content: left;
  flex-direction: row;
  width: 85%;
  color: ${({ theme }) => theme.colors.proposalText.grey};
`;

const ButtonText = styled(ContainerText).attrs(() => ({
  variant: 'medium',
}))`
  justify-content: space-between;
  flex-direction: row;
  color: ${({ theme }) => theme.colors.proposalText.grey};
`;

const ExternalButton = styled(ActionsButton).attrs(() => ({
  variant: 'secondary',
}))`
  justify-content: space-between;
`;

const ActionModal: React.FC = () => {
  //TODO: remove hardcoded external contracts with actual data

  const { setModalView, setTransferBuilder, transferBuilder, setIsOpen } =
    useActionsBuilder();

  const handleTransfer = () => {
    setTransferBuilder(true);
    setIsOpen(false);
  };

  return (
    <Wrapper>
      <CoreWrapper>
        <WrapperText>Core</WrapperText>
        <ActionsButton disabled={transferBuilder} onClick={handleTransfer}>
          <StyledIcon src={Vector} />
          Transfer & Mint
        </ActionsButton>
      </CoreWrapper>
      <ExternalWrapper>
        <WrapperText>External Contracts</WrapperText>
        <ExternalButton
          onClick={() =>
            setModalView(content => [
              ...content,
              ActionsModalView.DxdaoController,
            ])
          }
        >
          DXdao Controller
          <ButtonText>2 Actions</ButtonText>
        </ExternalButton>
        <ExternalButton>
          Permissions Registry
          <ButtonText>4 Actions</ButtonText>
        </ExternalButton>
        <ExternalButton>
          DXD Voting Machine
          <ButtonText>1 Actions</ButtonText>
        </ExternalButton>
        <ExternalButton>
          RegistrarWalletScheme
          <ButtonText>2 Actions</ButtonText>
        </ExternalButton>
        <ExternalButton>
          MasterWalletScheme
          <ButtonText>1 Actions</ButtonText>
        </ExternalButton>
        <ExternalButton>
          QuickWalletScheme
          <ButtonText>1 Actions</ButtonText>
        </ExternalButton>
        <ExternalButton>
          SWPRWalletScheme
          <ButtonText>1 Actions</ButtonText>
        </ExternalButton>
      </ExternalWrapper>
    </Wrapper>
  );
};

export default ActionModal;
