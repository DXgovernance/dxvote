import React from 'react';
import styled from 'styled-components';
import { FiChevronLeft } from 'react-icons/fi';
import { useHistory } from 'react-router-dom';
import { MdOutlinePreview, MdOutlineModeEdit, MdLink } from 'react-icons/md';
import sanitizeHtml from 'sanitize-html';
import { Box, Flex } from '../../components/Guilds/common/Layout';
import { IconButton } from '../../components/Guilds/common/Button';
import { Input } from '../../components/Guilds/common/Form';
import SidebarCard from '../../components/Guilds/SidebarCard';
import Editor from 'components/Guilds/Editor';

import useLocalStorageWithExpiry from 'hooks/Guilds/useLocalStorageWithExpiry';

const PageContainer = styled(Box)`
  display: grid;
  grid-template-columns: 1fr;

  @media only screen and (min-width: 768px) {
    grid-template-columns: minmax(0, 1fr) 300px;
  }
`;

const SidebarContent = styled(Box)`
  @media only screen and (min-width: 768px) {
    margin-left: 1rem;
  }
  @media only screen and (max-width: 768px) {
    margin-top: 1rem;
  }
`;

const PageContent = styled(Box)`
  @media only screen and (min-width: 768px) {
    margin-right: 1rem;
  }
`;

const Button = styled(IconButton)`
  margin: 0;
`;

const SidebarHeader = styled.h3`
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
  padding: 16px;
  margin: 0;
`;

const Label = styled.span`
  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: ${({ size }) => (size ? size : `14px`)};
  line-height: 20px;
  display: flex;
  color: ${({ color }) => (color ? color : `#000000`)};
  margin-bottom: 0.5rem;
`;

const CreateProposalPage: React.FC = () => {
  const ttlMs = 345600000;
  const history = useHistory();
  const [editMode, setEditMode] = React.useState(true);
  const [title, setTitle] = React.useState('');
  const [referenceLink, setReferenceLink] = React.useState('');
  const [proposalBodyHTML, setProposalBodyHTML] =
    useLocalStorageWithExpiry<string>(
      `guild/newProposal/description/html`,
      null,
      ttlMs
    );
  const [proposalBodyMd, setProposalBodyMd] = useLocalStorageWithExpiry<string>(
    `guild/newProposal/description/md`,
    null,
    ttlMs
  );

  const handleToggleEditMode = () => {
    // TODO: add proper validation if toggle from edit to preview without required fields
    if (editMode && !title.trim() && !proposalBodyMd.trim()) return;
    setEditMode(v => !v);
  };

  const handleBack = () => history.push('/');

  const handleCreateProposal = () => {
    // TODO: build this functionality
  };

  return (
    <PageContainer>
      <PageContent>
        <Flex
          direction="row"
          justifyContent="space-between"
          margin="0px 0px 24px"
        >
          <Button iconLeft onClick={handleBack}>
            <FiChevronLeft />
            Back to Overview
          </Button>

          <Button
            padding="8px"
            onClick={handleToggleEditMode}
            disabled={!title || !proposalBodyMd}
            data-testId="create-proposal-editor-toggle-button"
          >
            {editMode ? (
              <MdOutlinePreview size={18} />
            ) : (
              <MdOutlineModeEdit size={18} />
            )}
          </Button>
        </Flex>
        <Box margin="0px 0px 24px">
          {editMode ? (
            <>
              <Label>Title</Label>
              <Input
                data-testId="create-proposal-title"
                placeholder="Proposal Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </>
          ) : (
            <Label size="24px"> {title}</Label>
          )}
        </Box>
        <Box margin="0px 0px 24px">
          {editMode ? (
            <>
              <Label color="#A1A6B0"> Reference link (optional)</Label>

              <Input
                placeholder="https://daotalk.org/..."
                value={referenceLink}
                onChange={e => setReferenceLink(e.target.value)}
                icon={<MdLink size={18} color="#BDC0C7" />}
                data-testId="create-proposal-link"
              />
            </>
          ) : referenceLink ? (
            <Label color="#A1A6B0" size="16px">
              {referenceLink}
            </Label>
          ) : null}
        </Box>
        {editMode ? (
          <Editor
            onMdChange={setProposalBodyMd}
            onHTMLChange={setProposalBodyHTML}
            content={proposalBodyHTML}
          />
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(proposalBodyHTML) }}
          />
        )}
        <Box margin="16px 0px">
          <Button
            onClick={handleCreateProposal}
            variant="secondary"
            disabled={editMode}
            data-testId="create-proposal-action-button"
          >
            Create Proposal
          </Button>
        </Box>
      </PageContent>
      <SidebarContent>
        <SidebarCard header={<SidebarHeader>Information</SidebarHeader>}>
          <Box padding="12px 0">
            <Flex
              direction="row"
              justifyContent="space-between"
              padding="5px 16px"
            >
              <Label> Consensus System</Label>
              <Label> Guild</Label>
            </Flex>
            <Flex
              direction="row"
              justifyContent="space-between"
              padding="5px 16px"
            >
              <Label> Proposal Duration</Label>
              <Label> 8 days</Label>
            </Flex>
            <Flex
              direction="row"
              justifyContent="space-between"
              padding="5px 16px"
            >
              <Label> Quorum</Label>
              <Label> 40%</Label>
            </Flex>
          </Box>
        </SidebarCard>
      </SidebarContent>
    </PageContainer>
  );
};

export default CreateProposalPage;
