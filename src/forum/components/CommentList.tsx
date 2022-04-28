import { useContent, useUpdate } from 'forum/hooks/useForum';
import { useRegistry } from 'forum/hooks/useRegistry';
import { formatDate } from 'utils';
import { CommentAvatar, ENSName } from './User';
import { Box, Text, Flex } from './common/Box';
import { Loading } from 'components/Guilds/common/Loading';
import ErrorMessage from './common/ErrorMessage';
import { useState } from 'react';
import Editor from 'components/Guilds/Editor';
import { Button } from 'components/Guilds/common/Button';
import { useConnect } from 'forum/hooks/useConnect';

function Comment({ id, author, did, created_at }) {
  const { connection } = useConnect();
  const [{ loading: isSaving }, update] = useUpdate();

  const [isEditing, setEditing] = useState(false);
  const [content, setContent] = useState('');
  const { data, error } = useContent(id);

  return (
    <Flex mb={4}>
      <CommentAvatar address={author} />
      <Box flex="1 100%">
        <Flex
          justifyContent="space-between"
          alignItems="center"
          height={'40px'}
        >
          <ENSName address={author} />
          <Flex alignItems="center">
            {connection.status === 'connected' &&
              connection?.selfID.id === did && (
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  Edit
                </Button>
              )}

            <Text ml={3}>{formatDate(created_at)}</Text>
          </Flex>
        </Flex>

        {!data && !error ? (
          <Loading loading text skeletonProps={{ width: '100%' }} />
        ) : error ? (
          <ErrorMessage error={error} />
        ) : (
          <Box mb={3}>
            <Text>{data?.content}</Text>
          </Box>
        )}

        {isEditing ? (
          <form
            onSubmit={async e => {
              e.preventDefault();
              await update({ id, content });
              setContent('');
              setEditing(false);
            }}
          >
            {/* Might be a good idea to extend Editor component so we can pass autoFocus or nrLines props etc */}
            <Editor content={data?.content} onMdChange={setContent} />
            <Flex justifyContent="flex-end">
              <Button variant="secondary">Cancel</Button>
              <Button variant="secondary" type="submit" disabled={isSaving}>
                Save
              </Button>
            </Flex>
          </form>
        ) : null}
      </Box>
    </Flex>
  );
}

export default function CommentList({ proposalId }) {
  let { data, error } = useRegistry({
    parent: proposalId,
    type: 'comment',
  });
  if (!data && !error) {
    return <Loading text loading skeletonProps={{ count: 3 }} />;
  }
  return (
    <div>
      {data.map(comment => (
        <Comment key={comment.id} {...comment} />
      ))}
    </div>
  );
}
