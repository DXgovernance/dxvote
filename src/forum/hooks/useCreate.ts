import { useForum } from 'forum/ForumProvider';
import { ForumEvent } from 'forum/types/ForumEvent';
import { setIdentity } from 'forum/utils/setIdentity';

import useAsyncFn from './useAsync';
import { useConnect } from './useConnect';

export function useCreate() {
  const { connection } = useConnect();
  const { orbitdb, registry } = useForum();

  return useAsyncFn(
    async props => {
      if (connection.status === 'connected') {
        const selfID = connection.selfID;

        // Link OrbitDB and Ceramic identities
        await setIdentity({ orbitdb, registry }, selfID.client);
        const now = getNow();
        const entity = {
          author: selfID.id,
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
