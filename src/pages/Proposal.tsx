import React from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useContext } from '../contexts';

import MDEditor from '@uiw/react-md-editor';
import { useHistory } from 'react-router-dom';
import contentHash from 'content-hash';
import { Box, Title } from '../components/common';

import {
  History,
  Calls,
  Votes,
  Status,
  Stakes,
  Details,
} from 'components/Proposal';

const ProposalInformationWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: row;
`;

const SidebarRow = styled.div`
  display: flex;
  justify-content: space-around;
  flex-direction: row;
  padding: 5px 0px;

  .timeText {
    font-size: 20;
    margin-left: -10px;
    width: 100%;
    text-align: center;
    padding-top: 5px;
  }

  span {
    margin-bottom: 5px;
  }
`;

const InfoSidebarBox = styled(Box)`
  max-width: 400px;
  min-width: 300px;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  padding: 10px 15px;
`;

const ProposalInfoSection = styled.div`
  max-width: 900px;
  width: 100%;
  flex-direction: column;
  margin-right: 15px;
`;

const ProposalInfoBox = styled(Box)`
  max-width: 900px;
  overflow-wrap: anywhere;
  padding: 20px 15px 10px 15px;
  justify-content: flex-start;
  overflow: auto;
`;

const SidebarDivider = styled.div`
  border-bottom: 1px solid gray;
  margin: 5px 10px;
`;

const ProposalPage = observer(() => {
  let history = useHistory();

  const {
    context: { daoStore, ipfsService },
  } = useContext();

  const proposalId = useLocation().pathname.split('/')[3];
  const proposal = daoStore.getProposal(proposalId);

  const [proposalDescription, setProposalDescription] = React.useState(
    '## Getting proposal description from IPFS...'
  );
  const [proposalTitle, setProposalTitle] = React.useState(
    proposal?.title?.length > 0
      ? proposal.title
      : 'Getting proposal title from IPFS...'
  );

  if (!proposal) {
    history.push('/');
    return null;
  }

  const proposalEvents = daoStore.getProposalEvents(proposalId);

  // @ts-ignore
  try {
    if (proposalDescription === '## Getting proposal description from IPFS...')
      ipfsService
        .getContent(contentHash.decode(proposal.descriptionHash))
        .then(data => {
          try {
            setProposalTitle(JSON.parse(data).title);
            setProposalDescription(JSON.parse(data).description);
          } catch (error) {
            setProposalDescription(data);
          }
        });
  } catch (error) {
    console.error('[IPFS ERROR]', error);
    setProposalTitle('Error getting proposal title from ipfs');
    setProposalDescription('Error getting proposal description from IPFS');
  }

  return (
    <ProposalInformationWrapper>
      <ProposalInfoSection>
        <ProposalInfoBox>
          <Title noMargin> {proposalTitle} </Title>
          <MDEditor.Markdown
            source={proposalDescription}
            style={{
              padding: '20px 10px',
              lineBreak: 'anywhere',
              whiteSpace: 'pre-line',
            }}
          />
          {proposal.descriptionHash.length > 0 && (
            <h3 style={{ margin: '0px' }}>
              <small>
                IPFS Document:{' '}
                <a
                  target="_blank"
                  href={`https://ipfs.io/ipfs/${contentHash.decode(
                    proposal.descriptionHash
                  )}`}
                  rel="noreferrer"
                >
                  ipfs://{contentHash.decode(proposal.descriptionHash)}
                </a>
              </small>
            </h3>
          )}
          <Calls />
        </ProposalInfoBox>

        <History proposalEvents={proposalEvents}></History>
      </ProposalInfoSection>
      <InfoSidebarBox>
        <Status />
        <SidebarDivider />
        <SidebarRow>
          <Details />
        </SidebarRow>
        <SidebarDivider />
        <Votes />
        <SidebarDivider />
        <Stakes />
      </InfoSidebarBox>
    </ProposalInformationWrapper>
  );
});

export default ProposalPage;
