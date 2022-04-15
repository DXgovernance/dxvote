import useAsyncFn from './useAsync';
import { useConnect } from './useConnect';

// We could generate these from the json-schema in scripts/create-model
export type EntryInput = {
  title?: string;
  author?: string;
  content?: string;
  parent?: string;
  type?: 'post' | 'comment' | 'like';
};

export type Entry = Partial<EntryInput> & {
  id: string;
  author: string;
  created_at: string;
  updated_at: string;
};

export function useCreate() {
  const { connection } = useConnect();
  return useAsyncFn(
    async props => {
      if (connection.status === 'connected') {
        const selfID = connection.selfID;

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

export const getNow = () => new Date().toISOString();
