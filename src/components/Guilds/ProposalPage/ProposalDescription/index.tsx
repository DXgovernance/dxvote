import { Loading } from 'components/Guilds/common/Loading';
import contentHash from 'content-hash';
import Markdown from 'markdown-to-jsx';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useProposal } from '../../../../hooks/Guilds/ether-swr/useProposal';
import useIPFSFile from '../../../../hooks/Guilds/ipfs/useIPFSFile';
import { ProposalMetadata } from '../../../../types/types.guilds';

const ProposalDescriptionWrapper = styled.div`
  margin: 1.5rem 0;
  line-height: 1.5;
  font-size: 16px;
  text-align: justify;
  color: ${({ theme }) => theme.colors.proposalText.lightGrey};
`;

const ProposalDescription = () => {
  const { guild_id: guildId, proposal_id: proposalId } = useParams<{
    chain_name: string;
    guild_id?: string;
    proposal_id?: string;
  }>();
  const { data: proposal, error } = useProposal(guildId, proposalId);

  const { decodedContentHash, decodeError } = useMemo(() => {
    if (!proposal?.contentHash) return {};

    try {
      return { decodedContentHash: contentHash.decode(proposal.contentHash) };
    } catch (e) {
      console.error(e);
      return { decodeError: e };
    }
  }, [proposal]);

  const { data: metadata, error: metadataError } =
    useIPFSFile<ProposalMetadata>(decodedContentHash);

  if (error || decodeError || metadataError) {
    return (
      <ProposalDescriptionWrapper>
        We ran into an error while trying to load the proposal content. Please
        refresh the page and try again.
      </ProposalDescriptionWrapper>
    );
  }

  return (
    <ProposalDescriptionWrapper>
      {metadata?.description ? (
        <Markdown>{metadata.description}</Markdown>
      ) : (
        <Loading loading text skeletonProps={{ width: '800px' }} />
      )}
    </ProposalDescriptionWrapper>
  );
};

export default ProposalDescription;
