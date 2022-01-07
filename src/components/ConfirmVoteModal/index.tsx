import { useState } from 'react';
import styled from 'styled-components';
import { hashVote, toEthSignedMessageHash } from 'utils';

import { Modal } from '../Modal';

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnWrap}
  margin: 5px 0px;
  padding: 5px 20px;
  width: 100%;
  background-color: ${({ theme }) => theme.backgroundColor};
  text-align: left;
`;

const SignedVoteDetails = styled.div`
  textAlign: center,
  fontSize: 15px,
  maxWidth: 100% - 20px
`

export interface ModalProps {
  onConfirm?: (any) => void;
  onCancel?: () => void;
  voteDecision: null | number;
  positive: number;
  negative: number;
  toAdd: number;
  voteDetails: {
    votingMachine: string,
    proposalId: string,
    voter: string,
    decision: string,
    repAmount: string,
    signVote: boolean
  };
}

export const ConfirmVoteModal: React.FC<ModalProps> = ({
  onCancel,
  onConfirm,
  voteDecision,
  positive,
  negative,
  toAdd,
  voteDetails,
}) => {
  const header = (
    <div>Confirm vote {voteDecision === 1 ? 'for' : 'against'} proposal</div>
  );

  const [shareSignatureOnOrbitDB, setShareSignatureOnOrbitDB] = useState(true);
  const [shareSignatureOnRinkeby, setShareSignatureOnRinkeby] = useState(false);

  const hashedVote = hashVote(
    voteDetails.votingMachine,
    voteDetails.proposalId,
    voteDetails.voter,
    voteDetails.decision,
    voteDetails.repAmount
  );

  return (
    <Modal
      header={header}
      isOpen={!(voteDecision === 0)}
      onDismiss={onCancel}
      onCancel={onCancel}
      onConfirm={() => {
        let voteConfirmed = {...voteDetails, networks: [shareSignatureOnOrbitDB, shareSignatureOnRinkeby]};
        onConfirm(voteConfirmed)
      }}
    >
      <Wrapper>
        {voteDetails.signVote ? (
          <b>Confirm vote signature</b>
        ) : (
          <b>Confirm vote transaction</b>
        )}
        <div>Vote on voting machine contract: {voteDetails.votingMachine}</div>
        <div>Vote in proposal: <small>{voteDetails.proposalId}</small></div>
        <div>Vote for decision: {voteDetails.decision === "1" ? "YES" : "NO"}</div>
        <div>Vote with REP amount: {voteDetails.repAmount}</div>
        <div>Vote with REP percentage: {toAdd}%</div>
        <br></br>

        {voteDetails.signVote &&
          <SignedVoteDetails>
            <strong>Vote Hash:</strong>
            <div><i>keccak256(votingMachine, proposalId, voter, decision, repAmount)</i></div>
            <strong>{hashedVote}</strong>
            <br></br>
            <br></br>

            <strong>ETH message to be signed:</strong>
            <div>Domain separator appended to the vote hash, more info in <a href="https://solidity-by-example.org/signature/">solidity signature example</a></div>
            <strong>{toEthSignedMessageHash(hashedVote)}</strong>

            <br></br>
            <br></br>
            <strong>Distribute signature On:</strong>
            <div>OrbitDB <input type="checkbox" checked={shareSignatureOnOrbitDB} onChange={() => setShareSignatureOnOrbitDB(!shareSignatureOnOrbitDB)}></input></div>
            <div>Rinkeby (Not recommended, needs an extra signature) <input type="checkbox" checked={shareSignatureOnRinkeby} onChange={() => setShareSignatureOnRinkeby(!shareSignatureOnRinkeby)}></input></div>
          </SignedVoteDetails>
        }
      </Wrapper>
    </Modal>
  );
};
