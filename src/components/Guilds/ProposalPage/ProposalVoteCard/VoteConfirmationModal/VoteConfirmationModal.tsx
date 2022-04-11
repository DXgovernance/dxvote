import React from 'react';
import {
  Container,
  Title,
  InfoItem,
  Widget,
  InfoRow,
  InfoLabel,
  InfoValue,
  ActionWrapper,
  Button,
} from './VoteConfirmationModal.styled';
import { Modal } from 'components/Guilds/common/Modal';

interface VoteConfirmationModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedAction?: string;
  onConfirm: () => void;
  votingPower?: string;
  previousVotingPercentage?: string;
}

export const VoteConfirmationModal: React.FC<VoteConfirmationModalProps> = ({
  isOpen,
  onDismiss,
  onConfirm,
  selectedAction,
  votingPower,
  previousVotingPercentage,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onDismiss}
      header="Confirm Vote"
      leftIcon={false}
      maxWidth={380}
    >
      <Container>
        <Title>Are you sure you want to vote "{selectedAction}"?</Title>
        <InfoItem>This action cannot be reverted</InfoItem>

        <Widget>
          <InfoRow>
            <InfoLabel>Option</InfoLabel>
            <InfoValue>{selectedAction}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Voting Power</InfoLabel>
            <InfoValue>{votingPower}%</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Vote Impact</InfoLabel>
            <InfoValue>
              <InfoValue grey> {previousVotingPercentage}% </InfoValue>
              {' -> '} {votingPower}%
            </InfoValue>
          </InfoRow>
        </Widget>
        <ActionWrapper>
          <Button variant="secondary" onClick={onDismiss}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Vote</Button>
        </ActionWrapper>
      </Container>
    </Modal>
  );
};
