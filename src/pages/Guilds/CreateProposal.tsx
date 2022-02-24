import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import contentHash from 'content-hash';
import { FiChevronLeft } from 'react-icons/fi';
import { useHistory, useParams } from 'react-router-dom';
import { MdOutlinePreview, MdOutlineModeEdit, MdLink } from 'react-icons/md';
import sanitizeHtml from 'sanitize-html';
import { Box, Flex } from '../../components/Guilds/common/Layout';
import { IconButton } from '../../components/Guilds/common/Button';
import { Input } from '../../components/Guilds/common/Form';
import {
  ActionsBuilder,
  SidebarInfoCard,
} from '../../components/Guilds/CreateProposalPage';
import Editor from 'components/Guilds/Editor';

import useLocalStorageWithExpiry from 'hooks/Guilds/useLocalStorageWithExpiry';
import { useTransactions } from 'contexts/Guilds';
import { useERC20Guild } from 'hooks/Guilds/contracts/useContract';
import useIPFSNode from 'hooks/Guilds/ipfs/useIPFSNode';
import { ZERO_ADDRESS, ZERO_HASH } from 'utils';

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

const StyledButton = styled(IconButton)`
  margin: 0;
  padding: 0.5rem 0.8rem;
  margin-left: ${props => props.marginLeft}; || 0
`;

const Label = styled.span`
  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: ${({ size }) => (size ? size : `14px`)};
  line-height: 20px;
  display: flex;
  color: ${({ color }) => (color ? color : '#BDC0C7')};
  margin: 12px 0px;
`;

const InputWrapper = styled(Flex)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const CreateProposalPage: React.FC = () => {
  const ttlMs = 345600000;
  const history = useHistory();
  const [editMode, setEditMode] = useState(true);
  const [title, setTitle] = useState('');
  const [referenceLink, setReferenceLink] = useState('');
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

  const ipfs = useIPFSNode();
  const uploadToIPFS = async () => {
    const content = { description: proposalBodyHTML, url: referenceLink };
    const cid = await ipfs.add(JSON.stringify(content));
    await ipfs.pin(cid);
    return contentHash.fromIpfs(cid);
  };

  const { createTransaction } = useTransactions();
  const { guild_id: guildAddress } = useParams<{ guild_id?: string }>();
  const guildContract = useERC20Guild(guildAddress);
  const handleCreateProposal = async () => {
    const contentHash = await uploadToIPFS();
    createTransaction(`Create proposal ${title}`, async () => {
      return guildContract.createProposal(
        [ZERO_ADDRESS],
        [ZERO_HASH],
        [1],
        0,
        title,
        `0x${contentHash}`
      );
    });
  };

  const isValid = useMemo(() => {
    if (!title) return false;
    if (!proposalBodyHTML) return false;

    return true;
  }, [title, proposalBodyHTML]);

  return (
    <PageContainer>
      <PageContent>
        <Flex
          direction="row"
          justifyContent="space-between"
          margin="0px 0px 24px"
        >
          <StyledButton iconLeft onClick={handleBack}>
            <FiChevronLeft />
            Change proposal type
          </StyledButton>

          <StyledButton
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
          </StyledButton>
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
              <Label>Reference link (optional)</Label>
              <InputWrapper>
                <Input
                  placeholder="https://daotalk.org/..."
                  value={referenceLink}
                  onChange={e => setReferenceLink(e.target.value)}
                  icon={<MdLink size={18} />}
                  data-testId="create-proposal-link"
                />
                <StyledButton variant="secondary" marginLeft={'1rem'}>
                  Import
                </StyledButton>
              </InputWrapper>
            </>
          ) : referenceLink ? (
            <>
              <Label size="16px">{referenceLink}</Label>
              <StyledButton> Import </StyledButton>
            </>
          ) : null}
        </Box>
        {editMode ? (
          <Editor
            onMdChange={setProposalBodyMd}
            onHTMLChange={setProposalBodyHTML}
            content={proposalBodyHTML}
            placeholder="What do you want to propose?"
          />
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(proposalBodyHTML) }}
          />
        )}
        <Box margin="16px 0px 24px">
          <ActionsBuilder proposalViewMode={!editMode} />
        </Box>
        <Box margin="16px 0px">
          <StyledButton
            onClick={handleCreateProposal}
            variant="secondary"
            disabled={!isValid}
            data-testId="create-proposal-action-button"
          >
            Create Proposal
          </StyledButton>
        </Box>
      </PageContent>
      <SidebarContent>
        <SidebarInfoCard />
      </SidebarContent>
    </PageContainer>
  );
};

export default CreateProposalPage;
