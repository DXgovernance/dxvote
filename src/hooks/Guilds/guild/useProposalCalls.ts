import { useState, useEffect } from 'react';
import { useTheme } from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { bulkDecodeCallsFromOptions } from '../contracts/useDecodedCall';
import useProposalMetadata from 'hooks/Guilds/ether-swr/guild/useProposalMetadata';
import { decodeCall } from 'hooks/Guilds/contracts/useDecodedCall';
import { useProposal } from '../ether-swr/guild/useProposal';
import { useVotingResults } from 'hooks/Guilds/ether-swr/guild/useVotingResults';
import { Call, Option } from 'old-components/Guilds/ActionsBuilder/types';
import { ZERO_HASH } from 'utils';
import { useRichContractRegistry } from '../contracts/useRichContractRegistry';
import { ERC20_APPROVE_SIGNATURE } from 'utils';

const isApprovalCall = (call: Call) =>
  call.data.substring(0, 10) === ERC20_APPROVE_SIGNATURE;

const useProposalCalls = (guildId: string, proposalId: string) => {
  // Decode calls from existing proposal
  const { data: proposal } = useProposal(guildId, proposalId);
  const { data: metadata } = useProposalMetadata(guildId, proposalId);
  const votingResults = useVotingResults(guildId, proposalId);
  const { contracts } = useRichContractRegistry();
  const { chainId } = useWeb3React();

  const theme = useTheme();
  const [options, setOptions] = useState<Option[]>([]);
  useEffect(() => {
    if (!guildId || !proposalId || !proposal) {
      setOptions([]);
      return;
    }
    async function decodeOptions() {
      const {
        totalVotes,
        to: toArray,
        data: dataArray,
        value: valuesArray,
      } = proposal;
      const totalOptions = totalVotes?.length - 1 || 0;
      const calls: Call[] = toArray?.map((to, index) => ({
        from: guildId,
        to: to,
        data: dataArray[index],
        value: valuesArray[index],
      }));
      const callsPerOption = toArray?.length / totalOptions;
      const splitCalls: Call[][] = [];
      for (let i = 0; i < totalOptions; i++) {
        splitCalls.push(
          calls.slice(i * callsPerOption, (i + 1) * callsPerOption)
        );
      }

      const voteOptions = metadata?.voteOptions;

      const encodedOptions: Option[] = await Promise.all(
        splitCalls.map(async (calls, index) => {
          const filteredActions = calls.filter(
            call => call.data !== ZERO_HASH || !call.value?.isZero()
          );

          const actions = await Promise.all(
            filteredActions.map(async (call, index, allCalls) => {
              if (isApprovalCall(call)) {
                const { decodedCall } = await decodeCall(
                  call,
                  contracts,
                  chainId
                );
                allCalls[index + 1].approval = {
                  amount: decodedCall?.args?._value,
                  token: call.to,
                };
              }
              return call;
            })
          );

          return {
            id: `option-${index}`,
            label:
              voteOptions && voteOptions[index]
                ? voteOptions[index]
                : `Option ${index + 1}`,
            color: theme?.colors?.votes?.[index],
            actions,
            totalVotes: votingResults?.options[index],
          };
        })
      );

      return bulkDecodeCallsFromOptions(encodedOptions, contracts, chainId);
    }
    decodeOptions().then(options => setOptions(options));
  }, [theme?.colors?.votes, contracts, chainId, guildId, proposalId, proposal]);

  return {
    options,
  };
};

export default useProposalCalls;
