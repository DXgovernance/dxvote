import React, { createContext, useEffect, useState } from 'react';
import { ConnectNetwork } from '@self.id/web';
import type { ModelTypeAliases, ModelTypesToAliases } from '@glazed/types';
import { Provider } from '@self.id/react';

import { useContext } from 'contexts';

import publishedModel from './model.json';

const model: ModelTypesToAliases<ModelTypeAliases<{}, {}>> = publishedModel;

const client = {
  ceramic: 'testnet-clay',
  connectNetwork: 'testnet-clay' as ConnectNetwork,
  model,
};

const OrbitDB = createContext({});

export const useForum = () => React.useContext(OrbitDB);

function useOrbitDB() {
  const { context } = useContext();
  const [state, setState] = useState({});

  useEffect(() => {
    if (context.orbitDBService) {
      context.orbitDBService.getOrbitDB().then(async orbitdb => {
        // Do we want to use a seperate DB for each chain?
        const dbName = `dxforum-0.1_${process.env.NODE_ENV || 'development'}`;
        const dbConfig = {
          create: true,
          sync: false,
          type: 'docstore',
          indexBy: 'id',
          accessController: {
            write: ['*'],
          },
        };
        const registry = await orbitdb.open(dbName, dbConfig);

        registry.load();

        setState({ orbitdb, registry });
      });
    }
  }, [context.orbitDBService]);

  return state;
}

function ForumProvider({ children }) {
  const value = useOrbitDB();
  return (
    <Provider client={client}>
      <OrbitDB.Provider value={value}>{children}</OrbitDB.Provider>
    </Provider>
  );
}

export default ForumProvider;
