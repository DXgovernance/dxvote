import useEtherSWR from 'ether-swr';
import { Middleware, SWRHook } from 'swr';
import { Proposal } from '../../../types/types.guilds';

const formatterMiddleware: Middleware =
  (useSWRNext: SWRHook) => (key, fetcher, config) => {
    const swr = useSWRNext(key, fetcher, config);
    return swr;
  };

export const useProposal = (guildId: string, proposalId: string) => {
  return useEtherSWR<Proposal>([guildId, 'getProposal', proposalId], {
    use: [formatterMiddleware],
  });
};
