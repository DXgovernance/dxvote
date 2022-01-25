import useEtherSWR from 'ether-swr';
import { unix } from 'moment';
import { Middleware, SWRHook } from 'swr';
import { Proposal } from '../../../types/types.guilds';

const formatterMiddleware: Middleware =
  (useSWRNext: SWRHook) => (key, fetcher, config) => {
    const swr = useSWRNext(key, fetcher, config);
    if (swr.data) {
      swr.data['startTime'] = unix(swr.data['startTime'].toNumber());
    }
    return swr;
  };

export const useProposal = (guildId: string, proposalId: string) => {
  return useEtherSWR<Proposal>([guildId, 'getProposal', proposalId], {
    use: [formatterMiddleware],
  });
};
