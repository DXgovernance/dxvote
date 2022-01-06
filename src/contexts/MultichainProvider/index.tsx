import { JsonRpcProvider } from '@ethersproject/providers';
import { createContext, useMemo } from 'react';
import { useRpcUrls } from '../../provider/providerHooks';

interface MultichainContextInterface {
  providers: Record<number, JsonRpcProvider>
}

export const MultichainContext = createContext<MultichainContextInterface>(null);

const MultichainProvider = ({ children }) => {
  const rpcUrls = useRpcUrls();

  const providers = useMemo(() => {
    if (!rpcUrls) return null;

    return Object.entries(rpcUrls).reduce((acc, [networkId, rpcUrl]) => {
      acc[Number.parseInt(networkId)] = new JsonRpcProvider(rpcUrl);
      return acc;
    }, {} as Record<number, JsonRpcProvider>);
  }, [rpcUrls]);

  if (!providers) return null;

  return (
    <MultichainContext.Provider
      value={{
        providers,
      }}
    >
      {children}
    </MultichainContext.Provider>
  );
};

export default MultichainProvider;
