import { useParams } from 'react-router';

import { useProposal } from 'hooks/Guilds/ether-swr/guild/useProposal';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { MAINNET_ID } from 'utils/constants';
import useVoteSummary from 'hooks/Guilds/useVoteSummary';

interface ProposalCardProps {
  id?: string;
  href?: string;
}
const ProposalCardWrapper: React.FC<ProposalCardProps> = ({ id, href }) => {
  const { guildId } = useParams();
  const { data: proposal, error } = useProposal(guildId, id);
  const votes = useVoteSummary(guildId, id);
  const { imageUrl, ensName } = useENSAvatar(proposal?.creator, MAINNET_ID);

  const isLoading = !proposal && !error;

  return (
    <UnstyledLink to={href || '#'}>
      <CardWrapper>
        <CardHeader>
          <IconDetailWrapper>
            {proposal?.creator ? (
              <Avatar src={imageUrl} defaultSeed={proposal.creator} size={24} />
            ) : (
              <Loading
                style={{ margin: 0 }}
                loading
                text
                skeletonProps={{ circle: true, width: '24px', height: '24px' }}
              />
            )}
            <Detail>
              {ensName ||
                (proposal?.creator ? (
                  shortenAddress(proposal.creator)
                ) : (
                  <Loading style={{ margin: 0 }} loading text />
                ))}
            </Detail>
          </IconDetailWrapper>
          <ProposalStatusWrapper>
            <ProposalStatus
              proposalId={id}
              bordered={false}
              showRemainingTime
            />
          </ProposalStatusWrapper>
        </CardHeader>
        <CardContent>
          <CardTitle size={2}>
            <strong>
              {proposal?.title || (
                <Loading style={{ margin: 0 }} loading text />
              )}
            </strong>
          </CardTitle>
        </CardContent>
        <CardFooter>
          <ProposalCardActionSummary isLoading={isLoading} />
          <ProposalCardVotes isLoading={isLoading} />
        </CardFooter>
      </CardWrapper>
    </UnstyledLink>
  );
};

export default ProposalCardWrapper;
