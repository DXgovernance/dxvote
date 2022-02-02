import { useCallback } from 'react';
import { BigNumber, ContractTransaction } from 'ethers';
import { useParams } from 'react-router-dom';
import { useERC20Guild } from './contracts/useContract';

//@TODO convert actions into set votes parameter
// transaction Modal
// @TODO actions?
// @TODO votingPower calculations

interface useVotesReturns {
  setVote: (
    action: BigNumber,
    votingPower: BigNumber
  ) => Promise<ContractTransaction>;
  //  setVotes: (action: BigNumber, votingPower: BigNumber) => Promise<ContractTransaction>;
  //    setSignedVote: () => void;
  //   setSignedVotes: () => void;
}

export const useVotes = (): useVotesReturns => {
  const { guild_id: guildId, proposal_id: proposalId } =
    useParams<{ guild_id?: string; proposal_id?: string }>();

  const contract = useERC20Guild(guildId, true);

  const setVote = useCallback(
    (action: BigNumber, votingPower: BigNumber) => {
      return contract.setVote(proposalId, action, votingPower);
    },
    [contract, guildId, proposalId]
  );

  return {
    setVote,
  };
};
