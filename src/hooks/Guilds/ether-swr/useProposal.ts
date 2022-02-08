import { unix } from 'moment';
import { Middleware, SWRHook } from 'swr';
import { Proposal } from '../../../types/types.guilds';
import useEtherSWR from './useEtherSWR';

const formatterMiddleware: Middleware =
  (useSWRNext: SWRHook) => (key, fetcher, config) => {
    const swr = useSWRNext(key, fetcher, config);
    if (swr.data) {
      const original = swr.data as any;

      const clone: any = Object.assign({}, swr.data);
      clone.startTime = original.startTime
        ? unix(original.startTime.toNumber())
        : null;
      clone.endTime = original.endTime
        ? unix(original.endTime.toNumber())
        : null;

      return { ...swr, data: clone };
    }
    return swr;
  };

export const useProposal = (guildId: string, proposalId: string) => {
  return useEtherSWR<Proposal>([guildId, 'getProposal', proposalId], {
    use: [formatterMiddleware],
  });
};
