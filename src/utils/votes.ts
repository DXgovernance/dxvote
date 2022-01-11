import { utils } from 'ethers';
import Web3 from 'web3';
import { toEthSignedMessageHash } from './signature';

export const hashVote = function (
  votingMachineAddress: string,
  proposalId: string,
  voter: string,
  decision: string,
  repAmount: string
) {
  return Web3.utils.soliditySha3(
    { type: 'address', value: votingMachineAddress },
    { type: 'bytes32', value: proposalId },
    { type: 'address', value: voter },
    { type: 'uint256', value: decision },
    { type: 'uint256', value: repAmount }
  );
};

export const verifySignedVote = function (
  votingMachineAddress: string,
  proposalId: string,
  voter: string,
  decision: string,
  repAmount: string,
  signature: string
) {
  try {
    const signer = utils.recoverAddress(
      toEthSignedMessageHash(
        hashVote(votingMachineAddress, proposalId, voter, decision, repAmount)
      ),
      signature
    );
    return signer == voter;
  } catch (error) {
    console.error('Error verifying vote signature', error);
    return false;
  }
};

export const parseSignedVoteMessage = function (signedVoteMessage: string): {
  valid: boolean;
  votingMachine: string;
  proposalId: string;
  voter: string;
  decision: string;
  repAmount: string;
  signature: string;
} {
  if (
    signedVoteMessage &&
    signedVoteMessage.length > 0 &&
    signedVoteMessage.split(':').length > 6
  ) {
    const signedVoteMessageSplitted = signedVoteMessage.split(':');
    return {
      valid: verifySignedVote(
        signedVoteMessageSplitted[1],
        signedVoteMessageSplitted[2],
        signedVoteMessageSplitted[3],
        signedVoteMessageSplitted[4],
        signedVoteMessageSplitted[5],
        signedVoteMessageSplitted[6]
      ),
      votingMachine: signedVoteMessageSplitted[1],
      proposalId: signedVoteMessageSplitted[2],
      voter: signedVoteMessageSplitted[3],
      decision: signedVoteMessageSplitted[4],
      repAmount: signedVoteMessageSplitted[5],
      signature: signedVoteMessageSplitted[6],
    };
  } else {
    return {
      valid: false,
      votingMachine: '',
      proposalId: '',
      voter: '',
      decision: '',
      repAmount: '',
      signature: '',
    };
  }
};

export const isVoteYes = function (vote) {
  return vote && vote.toString() == '1';
};

export const isVoteNo = function (vote) {
  return vote && vote.toString() == '2';
};
