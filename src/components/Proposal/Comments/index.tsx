import {
  useComments,
  useConvoAuth,
  useCreateComment,
  useUpvoteComment,
} from 'hooks/useComments';
import { useState } from 'react';
import styled from 'styled-components';
import { Button, Title, Box } from '../../common';
import moment from 'moment';

const Wrapper = styled(Box)``;
const CommentInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  padding: 8px;
`;

const Comment = styled.div`
  padding: 8px 0;
  margin-bottom: 16px;
`;
const CommentText = styled.div``;
const CommentTimestamp = styled.div``;

const CommentAuthor = styled.div`
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const initialState = { comment: '' };
const CommentForm = ({ isPosting, onSubmit }) => {
  const [state, setState] = useState<{ comment: string }>(initialState);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setState(s => ({ ...s, [name]: value }));
  }
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(state);
        setState({ comment: '' });
      }}
    >
      <Flex justifyContent="flex-end">
        <CommentInput
          disabled={isPosting}
          name="comment"
          placeholder="Write a comment..."
          rows={4}
          value={state.comment}
          onChange={handleChange}
        />
        <Button type="submit" disabled={isPosting}>
          Send
        </Button>
      </Flex>
    </form>
  );
};

const Comments = ({ threadId }) => {
  const [_, getToken] = useConvoAuth();
  const [{ data = [], loading }, refetchComments] = useComments(threadId);
  const [{ loading: isPosting }, createComment] = useCreateComment();

  async function handleCreateComment({ comment }) {
    getToken().then(token =>
      createComment({ threadId, token, comment }).then(refetchComments)
    );
  }

  return (
    <Wrapper style={{ marginTop: '15px' }}>
      <Title noMargins>Comments</Title>
      <CommentForm
        isPosting={isPosting || loading}
        onSubmit={handleCreateComment}
      />
      {data.map(comment => (
        <Comment key={comment._id}>
          <CommentAuthor>
            <span>By: {comment.authorENS || comment.author}</span>
            <span>{moment(+comment.createdOn).fromNow()}</span>
          </CommentAuthor>
          <CommentTimestamp></CommentTimestamp>
          <Flex justifyContent="space-between">
            <CommentText>{decodeURIComponent(comment.text)}</CommentText>
            <UpvoteButton commentId={comment._id} />
          </Flex>
        </Comment>
      ))}
    </Wrapper>
  );
};

const UpvoteButton = ({ commentId }) => {
  const [_, getToken] = useConvoAuth();
  const [{ loading }, toggleUpvote] = useUpvoteComment();

  async function handleToggleUpvote() {
    getToken().then(token => toggleUpvote({ token, commentId }));
  }

  return (
    <Button disabled={loading} onClick={handleToggleUpvote}>
      +1
    </Button>
  );
};

const Flex = styled.div`
  display: flex;
  justify-content: ${props => props.justifyContent || 'start'};
`;
export default Comments;
