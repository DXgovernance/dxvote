import { useContent } from 'forum/hooks/useForum';
import { useRegistry } from 'forum/hooks/useRegistry';
import { formatDate } from 'utils';
import { CommentAvatar, ENSName } from './User';
import { Box, Text, Flex } from './common/Box';

function Comment({ id, author, created_at }) {
  const { data, error, loading } = useContent(id);
  console.log('COmment', data, error, loading);
  return (
    <Flex mb={4}>
      <CommentAvatar address={author} />
      <Box flex="1 100%">
        <Flex justifyContent="space-between" mb={2}>
          <ENSName address={author} />
          <Text>{formatDate(created_at)}</Text>
        </Flex>

        <Box>
          <Text>{data?.content}</Text>
        </Box>
      </Box>
    </Flex>
  );
}

export default function CommentList({ proposalId }) {
  const {
    data = [],
    error,
    loading,
  } = useRegistry({
    parent: proposalId,
    type: 'comment',
  });

  console.log(data, error, loading);
  return (
    <div>
      {data.map(comment => (
        <Comment key={comment.id} {...comment} />
      ))}
    </div>
  );
}
