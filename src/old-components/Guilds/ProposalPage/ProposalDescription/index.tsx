import { useTypedParams } from 'Modules/Guilds/Hooks/useTypedParams';
import Markdown from 'markdown-to-jsx';
import { Loading } from 'Components/Primitives/Loading';
import styled from 'styled-components';
import useProposalMetadata from 'hooks/Guilds/useProposalMetadata';

const ProposalDescriptionWrapper = styled.div`
  margin: 1.5rem 0;
  line-height: 1.5;
  font-size: 16px;
  text-align: justify;
  color: ${({ theme }) => theme.colors.proposalText.lightGrey};
`;

const ProposalDescription = () => {
  const { guildId, proposalId } = useTypedParams();
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
