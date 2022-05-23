import { useState, useEffect, useMemo } from 'react';
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
import useGuildImplementationTypeConfig from './useGuildImplementationType';

const isApprovalCall = (call: Call) =>
  call.data.substring(0, 10) === ERC20_APPROVE_SIGNATURE;

const useProposalCalls = (guildId: string, proposalId: string) => {
  // Decode calls from existing proposal
  const { data: proposal } = useProposal(guildId, proposalId);
  const { data: metadata } = useProposalMetadata(guildId, proposalId);
  const votingResults = useVotingResults(guildId, proposalId);
  const { contracts } = useRichContractRegistry();
  const { chainId } = useWeb3React();
  const { isEnforcedBinaryGuild } = useGuildImplementationTypeConfig(guildId);

  const theme = useTheme();
  const [options, setOptions] = useState<Option[]>([]);

  const {
    totalVotes,
    to: toArray,
    data: dataArray,
    value: valuesArray,
  } = proposal || {};

  const totalOptionsNum = totalVotes?.length - 1 || 0;
  const callsPerOption = totalOptionsNum
    ? toArray?.length / totalOptionsNum
    : 0;
  const optionLabels = metadata?.voteOptions;

  const calls: Call[] = useMemo(() => {
    return toArray?.map((to, index) => ({
      from: guildId,
      to: to,
      data: dataArray[index],
      value: valuesArray[index],
    }));
  }, [guildId, dataArray, valuesArray, toArray]);

  const splitCalls = useMemo(() => {
    if (!calls) return null;

    const splitCalls: Call[][] = [];
    for (let i = 0; i < totalOptionsNum; i++) {
      splitCalls.push(
        calls.slice(i * callsPerOption, (i + 1) * callsPerOption)
      );
    }
    return splitCalls;
  }, [calls, callsPerOption, totalOptionsNum]);

  useEffect(() => {
    if (!guildId || !proposalId || !splitCalls) {
      setOptions([]);
      return;
    }
    async function decodeOptions() {
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

          const isEnforcedBinaryLastOption =
            isEnforcedBinaryGuild && index === totalOptionsNum - 1;
          const optionLabel =
            optionLabels?.[index] || isEnforcedBinaryLastOption
              ? 'Against'
              : null;

          return {
            id: `option-${index}`,
            label: optionLabel || `Option ${index + 1}`,
            color: theme?.colors?.votes?.[index],
            actions,
            totalVotes: votingResults?.options[index],
          };
        })
      );

      return bulkDecodeCallsFromOptions(encodedOptions, contracts, chainId);
    }
    decodeOptions().then(options => setOptions(options));
  }, [
    guildId,
    proposalId,
    contracts,
    chainId,
    splitCalls,
    theme,
    optionLabels,
    isEnforcedBinaryGuild,
    totalOptionsNum,
  ]);

  return {
    options,
  };
};

export default useProposalCalls;
