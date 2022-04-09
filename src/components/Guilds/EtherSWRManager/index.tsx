import { EtherSWRConfig } from 'ether-swr';
import useJsonRpcProvider from 'hooks/Guilds/web3/useJsonRpcProvider';
import loggerMiddleware from 'hooks/Guilds/ether-swr/middleware/logger';
import React from 'react';

const EtherSWRManager: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const provider = useJsonRpcProvider();

  return (
    <EtherSWRConfig
      value={{
        web3Provider: provider,
        refreshInterval: 30000,
        use: [loggerMiddleware],
      }}
    >
      {children}
    </EtherSWRConfig>
  );
};

export default EtherSWRManager;
