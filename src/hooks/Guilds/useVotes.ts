import { useCallback } from 'react';
import { BigNumber } from 'ethers';
import { useParams } from 'react-router-dom';
import { useERC20Guild } from './contracts/useContract';
import { useVotingPowerOf } from './ether-swr/useVotingPowerOf';
import { useWeb3React } from '@web3-react/core';
import { useTransactions } from 'contexts/Guilds';

interface useVotesReturns {
  setVote: (action: BigNumber) => Promise<void>;
}

export const useVotes = (): useVotesReturns => {
  const { guild_id: guildId, proposal_id: proposalId } =
    useParams<{ guild_id?: string; proposal_id?: string }>();

  const contract = useERC20Guild(guildId, true);

  const { account } = useWeb3React();

  const { createTransaction } = useTransactions();

  const votingPowerProps = {
    contractAddress: guildId,
    userAddress: account,
  };

  const { data } = useVotingPowerOf(votingPowerProps);

  const setVote = useCallback(
    async (action: BigNumber) => {
      const votingPower = BigNumber.from(data);
      createTransaction('set Vote', async () =>
        contract.setVote(proposalId, action, votingPower)
      );
    },
    [contract, guildId, proposalId, data]
  );

  return {
    setVote,
  };
};
