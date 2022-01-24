import useEtherSWR from 'ether-swr';

function myMiddleware (useSWRNext) {
  return (key, fetcher, config) => {
    // Before hook runs...

    // Handle the next middleware, or the `useSWR` hook if this is the last one.
    const swr = useSWRNext(key, fetcher, config)

    // After hook runs...
    return swr
  }
}

export const useProposal = (guildId: string, proposalId: string) => {
  return useEtherSWR([guildId, 'getProposal', proposalId], { use: [myMiddleware] });
};
