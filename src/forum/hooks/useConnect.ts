import { useViewerConnection } from '@self.id/react';
import { EthereumAuthProvider } from '@self.id/web';

import { useWeb3React } from '@web3-react/core';
import useLocalStorage from 'hooks/Guilds/useLocalStorage';
import { useCallback, useEffect } from 'react';

export function useConnect() {
  const { account, connector } = useWeb3React();
  const [connection, connectCeramic, disconnectCeramic] = useViewerConnection();
  const [storedDid, setDid] = useLocalStorage('did', '');

  const connect = useCallback(async () => {
    try {
      console.log('Connecting Ceramic...', connector, account);
      // Use current Web3 provider
      const provider = await connector.getProvider();
      const user = await connectCeramic(
        new EthereumAuthProvider(provider, account)
      );
      // Store in localStorage for future use
      setDid(user?.id || '');
    } catch (error) {
      console.log('Ceramic Auth error:', error);
    }
  }, [account, connector, connectCeramic, setDid]);

  const disconnect = () => {
    disconnectCeramic();
    setDid('');
  };

  // Automatically connect if DID is stored from previous session
  useEffect(() => {
    storedDid && connection.status === 'idle' && connect();
  }, [storedDid, connect, connection]);

  return { connection, connect, disconnect };
}
