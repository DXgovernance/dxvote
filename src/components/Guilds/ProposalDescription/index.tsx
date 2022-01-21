
import contentHash from 'content-hash';
import useEtherSWR from 'ether-swr';
import Markdown from 'markdown-to-jsx';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styled from "styled-components"
import useIPFSFile from '../../../hooks/Guilds/ipfs/useIPFSFile';
import { ProposalMetadata } from '../../../types/types.guilds';

const ProposalDescriptionWrapper = styled.div`
  margin: 1.5rem 0;
  line-height: 1.5;
  font-size: 16px;
  text-align: justify;
`;

const ProposalDescription = () => {
  const { guild_id: guildId, proposal_id: proposalId } = useParams<{
    chain_name: string;
    guild_id?: string;
    proposal_id?: string;
  }>();
  const { data: proposal, error } = useEtherSWR([
    guildId,
    'getProposal',
    proposalId,
  ]);

  const decodedContentHash = useMemo(() => {
    try {
      return contentHash.decode(proposal.contentHash);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [proposal]);
  const metadata = useIPFSFile<ProposalMetadata>(decodedContentHash);

  if (error) {
    return (
      <div>
        We ran into an error while trying to load the proposal content. Please
        refresh the page and try again.
      </div>
    );
  }

  if (!metadata) {
    return <div>loading</div>;
  }

  if (!metadata?.description) {
    return null;
  }

  return (
    <ProposalDescriptionWrapper>
      <Markdown>{metadata?.description}</Markdown>
    </ProposalDescriptionWrapper>
  );
};

export default ProposalDescription;