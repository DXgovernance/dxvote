import { EtherSWRConfig } from 'ether-swr';
import useJsonRpcProvider from 'hooks/useJsonRpcProvider';
import loggerMiddleware from 'hooks/ether-swr/middleware/logger';

const EtherSWRManager: React.FC = ({ children }) => {
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
