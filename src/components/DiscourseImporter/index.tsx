import { useState } from 'react';
import styled from 'styled-components';
import { DISCOURSE_URL_ROOT } from '../../utils';
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
  border: 1px solid ${props => (props.invalid ? 'red' : 'gray')};
  padding: 0px 5px;
`;

const ErrorMessage = styled.span`
  font-size: 0.8rem;
  color: red;
`;
interface DiscourseImporterProps {
  onImport: (importedMarkdown: string) => void;
}

const DiscourseImporter: React.FC<DiscourseImporterProps> = ({ onImport }) => {
  const [discourseLink, setDiscourseLink] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>(null);

  const parseDiscourseUrlTopicId = (urlString: string): number | null => {
    if (urlString.startsWith(DISCOURSE_URL_ROOT)) {
      // Try to parse the string as a URL
      try {
        const url = new URL(urlString);
        const path = url.pathname;

        // Extract topicId from a topic URL
        if (path.startsWith('/t')) {
          const topicId = Number.parseInt(path.split('/')[3]);
          console.info('[DiscourseImporter] Found topic ID', topicId);
          return topicId;
        }
      } catch (e) {
        console.error(
          '[DiscourseImporter] Error while extracting topicId from URL.',
          e
        );
      }
    }

    console.warn('[DiscourseImporter] Incorrect URL entered.');
    return null;
  };

  const getTopic = async (topicId: number) => {
    const response = await fetch(
      `${DISCOURSE_URL_ROOT}/t/${topicId}.json`,
      {
        headers: { 'content-type': 'application/json' },
      }
    );
    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      console.error('[DiscourseImporter] Error while obtaining topic.');
      throw new Error('Unable to get topic.');
    }
  };

  const getPost = async (postId: number) => {
    const response = await fetch(
      `${DISCOURSE_URL_ROOT}/posts/${postId}.json`,
      {
        headers: { 'content-type': 'application/json' },
      }
    );
    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      console.error('[DiscourseImporter] Error while obtaining post content.');
      throw new Error('Unable to get post content.');
    }
  };

  const processImport = async () => {
    setIsImporting(true);
    const topicId = parseDiscourseUrlTopicId(discourseLink);
    if (!topicId) {
      setIsInvalid(true);
      setErrorMessage('Incorrect URL. Please recheck.');
      setIsImporting(false);
      return;
    }

    try {
      const topic = await getTopic(topicId);
      const post = await getPost(topic.post_stream.stream[0]);
      onImport(post.raw);
    } catch (e) {
      setIsInvalid(true);
      setErrorMessage(e?.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Container>
      <LinkLabel htmlFor="link-input">Enter DAOtalk forum post URL</LinkLabel>
      <InputRow>
        <LinkInput
          name="link-input"
          value={discourseLink}
          onChange={e => {
            setIsInvalid(false);
            setErrorMessage(null);
            setDiscourseLink(e.target.value);
          }}
          invalid={isInvalid}
        />
        <Button onClick={processImport} disabled={isImporting}>
          {isImporting ? 'Importing...' : 'Import'}
        </Button>
      </InputRow>
      <ErrorMessage>{errorMessage}</ErrorMessage>
    </Container>
  );
};

export default DiscourseImporter;
