import { Loading } from 'components/Guilds/common/Loading';
import useProposalMetadata from 'hooks/Guilds/ether-swr/guild/useProposalMetadata';
import Markdown from 'markdown-to-jsx';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const ProposalDescriptionWrapper = styled.div`
  margin: 1.5rem 0;
  line-height: 1.5;
  font-size: 16px;
  text-align: justify;
  color: ${({ theme }) => theme.colors.proposalText.lightGrey};
`;

const ProposalDescription = () => {
  const { guild_id: guildId, proposal_id: proposalId } = useParams<{
    guild_id?: string;
    proposal_id?: string;
  }>();
  const { data: metadata, error } = useProposalMetadata(guildId, proposalId);

  if (error) {
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
