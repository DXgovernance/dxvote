import { useTheme } from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import { ZERO_HASH } from 'utils';
import { useRichContractRegistry } from '../contracts/useRichContractRegistry';
import { bulkDecodeCallsFromOptions } from '../contracts/useDecodedCall';
import useProposalMetadata from 'hooks/Guilds/ether-swr/guild/useProposalMetadata';
import { useProposal } from '../ether-swr/guild/useProposal';
import { Call, Option } from 'old-components/Guilds/ActionsBuilder/types';

const useProposalCalls = (guildId: string, proposalId: string) => {
  // Decode calls from existing proposal
  const { data: proposal } = useProposal(guildId, proposalId);
  const { data: metadata } = useProposalMetadata(guildId, proposalId);
  const { contracts } = useRichContractRegistry();
  const { chainId } = useWeb3React();

  const theme = useTheme();

  const options: Option[] = useMemo(() => {
    if (!guildId || !proposalId || !proposal) return null;

    const {
      to: toArray,
      data: dataArray,
      value: valuesArray,
      totalVotes,
    } = proposal;

    const calls: Call[] = toArray.map((to, index) => ({
      from: guildId,
      to: to,
      data: dataArray[index],
      value: valuesArray[index],
    }));

    const totalOptionsNum = totalVotes.length - 1;

    const callsPerOption = toArray.length / totalOptionsNum;
    const splitCalls: Call[][] = [];
    for (let i = 0; i < totalOptionsNum; i++) {
      splitCalls.push(
        calls.slice(i * callsPerOption, (i + 1) * callsPerOption)
      );
    }

    const voteOptions = metadata?.voteOptions;

    const encodedOptions: Option[] = splitCalls.map((calls, index) => ({
      id: `option-${index}`,
      label:
        voteOptions && voteOptions[index]
          ? voteOptions[index]
          : `Option ${index + 1}`,
      color: theme?.colors?.votes?.[index],
      actions: calls.filter(
        call => call.data !== ZERO_HASH || !call.value?.isZero()
      ),
    }));

    return bulkDecodeCallsFromOptions(encodedOptions, contracts, chainId);
  }, [theme, proposal, proposalId, guildId, chainId, contracts]);

  return {
    options,
  };
};

export default useProposalCalls;
