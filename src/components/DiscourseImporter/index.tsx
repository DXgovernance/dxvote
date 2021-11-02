import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../common';

const Container = styled.div`
  margin-bottom: 10px;
`;

const LinkLabel = styled.label`
  font-size: 0.9rem;
`;

const InputRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const LinkInput = styled.input`
  margin-top: 5px;
  width: 100%;
  height: 32px;
  margin-top: 5px;
  border-radius: 3px;
  border: 1px solid gray;
  padding: 0px 5px;
`;

interface DiscourseImporterProps {
  onImport: (importedMarkdown: string) => void;
}

const DiscourseImporter: React.FC<DiscourseImporterProps> = ({ onImport }) => {
  const [discourseLink, setDiscourseLink] = useState('');

  const getTopic = async (topicId: number) => {
    const response = await fetch(`https://daotalk.org/t/${topicId}.json`, {
      headers: { 'content-type': 'application/json' },
    });
    const result = await response.json();

    return result;
  };

  const getPost = async (postId: number) => {
    const response = await fetch(`https://daotalk.org/posts/${postId}.json`, {
      headers: { 'content-type': 'application/json' },
    });
    const result = await response.json();

    return result;
  };

  const processImport = async () => {
    const topic = await getTopic(3276);
    const post = await getPost(topic.post_stream.stream[0]);
    onImport(post.raw);
  };

  return (
    <Container>
      <LinkLabel htmlFor="link-input">Enter forum post URL</LinkLabel>
      <InputRow>
        <LinkInput
          name="link-input"
          value={discourseLink}
          onChange={e => setDiscourseLink(e.target.value)}
        />
        <Button onClick={processImport}>Import</Button>
      </InputRow>
    </Container>
  );
};

export default DiscourseImporter;
