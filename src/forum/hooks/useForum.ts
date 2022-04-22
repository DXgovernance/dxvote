import { useForum } from 'forum/ForumProvider';
import { ForumEvent } from 'forum/types/ForumEvent';

import { useAsync, useAsyncFn } from './useAsync';
import { useConnect } from './useConnect';

import { useClient } from '@self.id/react';
import { useWeb3React } from '@web3-react/core';

export function useContent(streamID) {
  const client = useClient();
  return useAsync(async () => client.tileLoader.load(streamID).then(mapId));
}

export function useCreate() {
  const { account } = useWeb3React();
  const { connection } = useConnect();
  const { registry } = useForum();

  return useAsyncFn(
    async props => {
      if (connection.status === 'connected') {
        console.time('creating post');
        const selfID = connection.selfID;

        const now = getNow();
        const entity = {
          author: account,
          did: selfID.id,
          created_at: now,
          updated_at: now,
          ...props,
        };

        const created = await selfID.client.dataModel
          // @ts-ignore
          .createTile('ForumPost', entity)
          .then(mapId);

        console.log('adding to registry', created.id);
        await registry.put(toIndex(created));

        console.timeEnd('creating post');
        return created.id;
      } else {
        throw new Error('Not connected to Ceramic');
      }
    },
    [connection]
  );
}

const mapId = doc => ({ id: doc.id.toString(), ...doc.content });

// Define what data to be indexed (currently everything except the content)
const toIndex = ({ content, ...data }: ForumEvent) => data;

export const getNow = () => new Date().toISOString();
