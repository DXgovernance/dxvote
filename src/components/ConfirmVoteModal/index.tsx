import styled from 'styled-components';

import { Modal } from '../Modal';

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.backgroundColor};
  border-radius: 10px;
`;

export interface ModalProps {
  voteDecision: null | number;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: (any) => void;
  onCancel?: () => void;
}

export const ConfirmVoteModal: React.FC<ModalProps> = ({
  voteDecision,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      header={<h1>Test</h1>}
      isOpen={!(voteDecision === null)}
      onDismiss={onCancel}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <Wrapper>{}</Wrapper>
    </Modal>
  );
};
