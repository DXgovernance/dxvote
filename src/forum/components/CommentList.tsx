import { useRegistry } from 'forum/hooks/useRegistry';

function Comment({ id, author, created_at }) {
  // Todo - load TileDocument and content
  // const { data, error, loading  } = useContent(id)
  return (
    <div>
      {author} - {id} - {created_at}
    </div>
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
