import styled from 'styled-components';

import { Modal } from '../Modal';

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnWrap}
  margin: 5px 0px;
  padding: 5px 20px;
  width: 100%;
  background-color: ${({ theme }) => theme.backgroundColor};
  text-align: left;
`;

export interface ModalProps {
  onConfirm?: (any) => void;
  onCancel?: () => void;
  voteDecision: null | number;
  positive: number;
  negative: number;
  toAdd: number;
  voteDetails: {
    votingMachine: string;
    proposalId: string;
    voter: string;
    decision: string;
    repAmount: string;
  };
}

export const ConfirmVoteModal: React.FC<ModalProps> = ({
  onCancel,
  onConfirm,
  voteDecision,
  toAdd,
  voteDetails,
}) => {
  const header = (
    <div>Confirm vote {voteDecision === 1 ? 'for' : 'against'} proposal</div>
  );

  return (
    <Modal
      header={header}
      isOpen={!(voteDecision === 0)}
      onDismiss={onCancel}
      onCancel={onCancel}
      onConfirm={() => {
        let voteConfirmed = {
          ...voteDetails,
        };
        onConfirm(voteConfirmed);
      }}
    >
      <Wrapper>
        <b>Confirm vote transaction</b>
        <div>Vote on voting machine contract: {voteDetails.votingMachine}</div>
        <div>
          Vote in proposal: <small>{voteDetails.proposalId}</small>
        </div>
        <div>
          Vote for decision: {voteDetails.decision === '1' ? 'YES' : 'NO'}
        </div>
        <div>Vote with REP amount: {voteDetails.repAmount}</div>
        <div>Vote with REP percentage: {toAdd}%</div>
        <br></br>
      </Wrapper>
    </Modal>
  );
};
