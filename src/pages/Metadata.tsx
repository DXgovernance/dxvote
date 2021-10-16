// Externals
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useParams, useHistory } from 'react-router-dom';
import MDEditor, { commands } from '@uiw/react-md-editor';

import { useContext } from '../contexts';
import { Button } from '../components/common/Button';
import { Box } from '../components/common';

import { sleep } from '../utils';

const ProposalsWrapper = styled.div`
  padding: 10px 0px;
  background: white;
  border-radius: 4px;
  display: grid;
  grid-template-columns: 30% 70%;
  grid-gap: 10px;
`;

const SidebarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  height: 80vh;
`;

const TextInput = styled.input`
  width: ${props => props.width || '100%'};
  height: 50px;
  border: 0;
  border-bottom: 1px solid #10161a33;
  margin-right: 5px;
  font-size: xx-large;
`;
const ButtonsWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  justify-content: space-around;
`;

const MarkdownWrapper = styled.div`
  display: flex;
  width: 110%;
  height: 80vh;
`;

const Editor = styled(MDEditor)`
  width: 50%;
  overflow: scroll;
`;

const Preview = styled(MDEditor.Markdown)`
  width: 50%;
  background-color: white;
  border: 1px solid #10161a33;
  border-radius: 3px;
  padding: 20px 10px;
  height: 80vh;
  overflow: scroll;
`;

const Error = styled.div`
  text-align: center;
  font-weight: 500;
  font-size: 20px;
  line-height: 18px;
  color: var(--dark-text-gray);
  padding: 25px 0px;
`;

export const CreateMetadataPage = observer(() => {
  const {
    context: { configStore, ipfsService, pinataService },
  } = useContext();

  const history = useHistory();
  const { proposalType } = useParams();

  const [proposalConfig, setProposalConfig] = useState({});

  useEffect(() => {
    const proposalTypes = configStore.getProposalTypes();
    setProposalConfig(proposalTypes.find(type => type.id === proposalType));
  }, []);

  const [descriptionText, setDescriptionText] = useState(
    localStorage.getItem('dxvote-newProposal-description') || ''
  );
  const [title, setTitle] = useState(
    localStorage.getItem('dxvote-newProposal-title') || ''
  );
  const [error, setError] = useState(null);

  const onTitleChange = newValue => {
    setTitle(newValue);
    localStorage.setItem('dxvote-newProposal-title', newValue);
  };

  const onDescriptionChange = newValue => {
    setDescriptionText(newValue);
    localStorage.setItem('dxvote-newProposal-description', newValue);
  };

  const uploadToIPFS = async function () {
    if (title.length < 10) {
      setError('Title has to be at mimimum 10 characters length');
    } else if (descriptionText.length === 0) {
      setError('Description has to be at mimimum 100 characters length');
    } else {
      setError(null);
      const bodyTextToUpload = JSON.stringify({
        description: descriptionText,
        title: title,
        tags: ['dxvote', 'contributorProposal'],
        url: '',
      });

      const hash = await ipfsService.add(bodyTextToUpload);
      localStorage.setItem('dxvote-newProposal-hash', hash);

      if (pinataService.auth) {
        const pinataPin = await pinataService.pin(hash);
        console.debug('[PINATA PIN]', pinataPin.data);
      }
      const ipfsPin = await ipfsService.pin(hash);
      console.debug('[IPFS PIN]', ipfsPin);

      let uploaded = false;
      while (!uploaded) {
        const ipfsContent = await ipfsService.getContent(hash);
        console.debug('[IPFS CONTENT]', ipfsContent);
        if (ipfsContent === bodyTextToUpload) uploaded = true;
        await sleep(1000);
      }

      history.push(`../submit/${proposalType}`);
    }
  };

  return (
    <div>
      {proposalConfig ? (
        <ProposalsWrapper>
          <SidebarWrapper>
            <TextInput
              type="text"
              placeholder="Title"
              onChange={event => onTitleChange(event.target.value)}
              value={title}
            />
            {error}
            <ButtonsWrapper>
              <Button onClick={() => history.push(`../../new`)}>Back</Button>
              <Button
                onClick={async () => {
                  await uploadToIPFS();
                }}
              >
                Next
              </Button>
            </ButtonsWrapper>
          </SidebarWrapper>
          <MarkdownWrapper>
            <Editor
              value={descriptionText}
              onChange={onDescriptionChange}
              preview="edit"
              height={window.innerHeight * 0.85}
              commands={[
                commands.bold,
                commands.italic,
                commands.strikethrough,
                commands.hr,
                commands.title,
                commands.divider,
                commands.link,
                commands.quote,
                commands.code,
                commands.image,
                commands.unorderedListCommand,
                commands.orderedListCommand,
                commands.checkedListCommand,
              ]}
            />
            <Preview source={descriptionText} />
          </MarkdownWrapper>
        </ProposalsWrapper>
      ) : (
        <Box>
          <Error>Error: Unknown proposal type</Error>
        </Box>
      )}
    </div>
  );
});
