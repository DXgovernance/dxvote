import { useForum } from 'forum/ForumProvider';
import { ForumEvent } from 'forum/types/ForumEvent';

import { useAsyncFn } from './useAsync';
import { useConnect } from './useConnect';

import { useClient } from '@self.id/react';
import { useWeb3React } from '@web3-react/core';
import useSWR, { useSWRConfig } from 'swr';

export function useContent(streamID) {
  const client = useClient();
  return useSWR(`/forum/${streamID}`, async () =>
    client.tileLoader.load(streamID).then(mapId)
  );
}

export function useCreate() {
  const { mutate } = useSWRConfig();

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

        mutate(`forum/registry`);
        console.timeEnd('creating post');
        return created.id;
      } else {
        throw new Error('Not connected to Ceramic');
      }
    },
    [connection]
  );
}

export function useUpdate() {
  const { mutate } = useSWRConfig();

  const { connection } = useConnect();
  const { registry } = useForum();
  const client = useClient();

  return useAsyncFn(async props => {
    console.time('updating post');
    if (connection.status === 'connected') {
      console.time('creating post');

      props.updated_at = getNow();
      const { id } = props;
      if (!id) {
        throw new Error('No id provided to update entry');
      }
      console.log('updating post', id, props);

      const updated = await client.tileLoader.load(id).then(async doc => {
        // Merge the new data with the existing data
        const patch = { ...doc.content, ...props };
        await doc?.update(patch);
        return patch;
      });

      console.log('post updated', updated);

      // Update registry
      await registry.put(toIndex(updated));

      // Update the UI where these queries are used
      mutate(`forum/${id}`);

      console.timeEnd('updating post');
      return id;
    } else {
      throw new Error('Not connected to Ceramic');
    }
  });
}

const mapId = doc => ({ id: doc.id.toString(), ...doc.content });

// Define what data to be indexed (currently everything except the content)
const toIndex = ({ content, ...data }: ForumEvent) => data;

export const getNow = () => new Date().toISOString();
