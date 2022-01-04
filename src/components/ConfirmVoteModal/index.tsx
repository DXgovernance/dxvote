import styled from 'styled-components';

import { Modal } from '../Modal';

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnWrap}
  margin: 16px 0px;
  padding: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.backgroundColor};
  text-align: center;
`;

export interface ModalProps {
  onConfirm?: (any) => void;
  onCancel?: () => void;
  voteDecision: null | number;
  positive: number;
  negative: number;
  toAdd: number;
  signedVote: boolean;
}

export const ConfirmVoteModal: React.FC<ModalProps> = ({
  onCancel,
  onConfirm,
  voteDecision,
  positive,
  negative,
  toAdd,
  signedVote,
}) => {
  const header = (
    <div>Confirm vote {voteDecision === 1 ? 'for' : 'against'} proposal</div>
  );

  return (
    <Modal
      header={header}
      isOpen={!(voteDecision === null)}
      onDismiss={onCancel}
      onCancel={onCancel}
      onConfirm={() => onConfirm(voteDecision)}
    >
      <Wrapper>
        {signedVote ? (
          <b>Confirm vote signature</b>
        ) : (
          <b>Confirm vote transaction</b>
        )}
        <div>For: {voteDecision === 1 ? positive + toAdd : positive}%</div>
        <div>Against: {voteDecision === 2 ? negative + toAdd : negative}%</div>
      </Wrapper>
    </Modal>
  );
};
