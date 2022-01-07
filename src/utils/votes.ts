import { utils } from "ethers";
import Web3 from "web3";
import { toEthSignedMessageHash } from "./signature";

export const hashVote = function(
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
  }

export const verifySignedVote = function(
    votingMachineAddress: string,
    proposalId: string,
    voter: string,
    decision: string,
    repAmount: string,
    signature: string
  ) {
    try {
      const signer = utils.recoverAddress(
        toEthSignedMessageHash(hashVote(
          votingMachineAddress,
          proposalId,
          voter,
          decision,
          repAmount
        )),
        signature
      );
      return signer == voter;
    } catch (error) {
      console.error('Error verifying vote signature', error);
      return false;
    }
  }