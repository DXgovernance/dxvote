import { useContent } from 'forum/hooks/useForum';
import { useRegistry } from 'forum/hooks/useRegistry';
import { formatDate } from 'utils';
import { CommentAvatar, ENSName } from './User';
import { Box, Text, Flex } from './common/Box';
import { Loading } from 'components/Guilds/common/Loading';
import ErrorMessage from './common/ErrorMessage';

function Comment({ id, author, created_at }) {
  const { data, error, loading } = useContent(id);

  return (
    <Flex mb={4}>
      <CommentAvatar address={author} />
      <Box flex="1 100%">
        <Flex justifyContent="space-between" mb={2}>
          <ENSName address={author} />
          <Text>{formatDate(created_at)}</Text>
        </Flex>

        {loading ? (
          <Loading loading text skeletonProps={{ width: '100%' }} />
        ) : error ? (
          <ErrorMessage error={error} />
        ) : (
          <Box>
            <Text>{data?.content}</Text>
          </Box>
        )}
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
