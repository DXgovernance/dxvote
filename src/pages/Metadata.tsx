// Externals
import { useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
// import { useHistory } from 'react-router-dom';
import MDEditor, { commands } from '@uiw/react-md-editor';

import { Button } from '../components/common/Button';
// import { useContext } from '../contexts';

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

export const CreateMetadataPage = observer(() => {
  // const {
  //   context: { configStore },
  // } = useContext();
  // const history = useHistory();

  const [descriptionText, setDescriptionText] = useState(
    localStorage.getItem('dxvote-newProposal-description') || ''
  );
  const [title, setTitle] = useState(
    localStorage.getItem('dxvote-newProposal-title') || ''
  );

  const onDescriptionChange = newValue => {
    setDescriptionText(newValue);
    localStorage.setItem('dxvote-newProposal-description', newValue);
  };

  return (
    <ProposalsWrapper>
      <SidebarWrapper>
        <TextInput
          type="text"
          placeholder="Title"
          onChange={event => setTitle(event.target.value)}
          value={title}
        />
        <ButtonsWrapper>
          <Button>Back</Button>
          <Button>Next</Button>
        </ButtonsWrapper>
      </SidebarWrapper>
      <MarkdownWrapper>
        <Editor
          value={descriptionText}
          onChange={onDescriptionChange}
          preview="edit"
          minHeights={'10000'}
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
  );
});
