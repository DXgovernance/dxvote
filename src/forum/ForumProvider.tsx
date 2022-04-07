import { ConnectNetwork } from '@self.id/web';
import type { ModelTypeAliases, ModelTypesToAliases } from '@glazed/types';

import publishedModel from './model.json';

import { Provider } from '@self.id/react';

const model: ModelTypesToAliases<ModelTypeAliases<{}, {}>> = publishedModel;

const client = {
  ceramic: 'testnet-clay',
  connectNetwork: 'testnet-clay' as ConnectNetwork,
  model,
};

function ForumProvider({ children }) {
  return <Provider client={client}>{children}</Provider>;
}

export default ForumProvider;
