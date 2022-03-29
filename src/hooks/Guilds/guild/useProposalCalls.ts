import { useWeb3React } from '@web3-react/core';
import { Call, Option } from 'components/Guilds/ActionsBuilder/types';
import { useMemo } from 'react';
import { ZERO_HASH } from 'utils';
import { useContractRegistry } from '../contracts/useContractRegistry';
import { bulkDecodeCallsFromOptions } from '../contracts/useDecodedCall';
import { useProposal } from '../ether-swr/guild/useProposal';

const useProposalCalls = (guildId: string, proposalId: string) => {
  // Decode calls from existing proposal
  const { data: proposal } = useProposal(guildId, proposalId);
  const { contracts } = useContractRegistry();
  const { chainId } = useWeb3React();

  const options: Option[] = useMemo(() => {
    if (!guildId || !proposalId || !proposal) return null;

    const {
      totalActions: totalOptions,
      to: toArray,
      data: dataArray,
      value: valuesArray,
    } = proposal;

    const calls: Call[] = toArray.map((to, index) => ({
      from: guildId,
      to: to,
      data: dataArray[index],
      value: valuesArray[index],
    }));

    const totalOptionsNum = totalOptions.toNumber();

    const callsPerOption = toArray.length / totalOptionsNum;
    const splitCalls: Call[][] = [];
    for (let i = 0; i < totalOptionsNum; i++) {
      splitCalls.push(
        calls.slice(i * callsPerOption, (i + 1) * callsPerOption)
      );
    }

    const encodedOptions: Option[] = splitCalls.map((calls, index) => ({
      index,
      label: `Option ${index + 1}`,
      actions: calls.filter(
        call => call.data !== ZERO_HASH || !call.value?.isZero()
      ),
    }));

    return bulkDecodeCallsFromOptions(encodedOptions, contracts, chainId);
  }, [proposal, proposalId, guildId, chainId, contracts]);

  return {
    options,
  };
};

export default useProposalCalls;
