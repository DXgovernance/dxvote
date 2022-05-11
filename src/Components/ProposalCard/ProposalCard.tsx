import ProposalCardActionSummary from 'Components/ProposalCard/ProposalCardActionSummary';
import ProposalCardVotes from 'Components/ProposalCard/ProposalCardVotes';
import { ProposalCardProps } from 'Components/ProposalCard/types';
import Avatar from 'old-components/Guilds/Avatar';
import ProposalStatus from 'Components/ProposalStatus/ProposalStatus';
import { Loading } from 'Components/Primitives/Loading';
import UnstyledLink from 'old-components/Guilds/common/UnstyledLink';
import 'react-loading-skeleton/dist/skeleton.css';
import { shortenAddress } from 'utils';
import {
  CardWrapper,
  CardHeader,
  IconDetailWrapper,
  Detail,
  CardContent,
  CardTitle,
  CardFooter,
} from 'Components/ProposalCard/ProposalCard.styled';

const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  votes,
  ensAvatar,
  href,
  statusProps,
}) => {
  return (
    <UnstyledLink to={href || '#'}>
      <CardWrapper>
        <CardHeader>
          <IconDetailWrapper>
            {proposal?.creator ? (
              <Avatar
                src={ensAvatar.imageUrl}
                defaultSeed={proposal.creator}
                size={24}
              />
            ) : (
              <Loading
                style={{ margin: 0 }}
                loading
                text
                skeletonProps={{ circle: true, width: '24px', height: '24px' }}
              />
            )}
            <Detail>
              {ensAvatar?.ensName ||
                (proposal?.creator ? (
                  shortenAddress(proposal.creator)
                ) : (
                  <Loading style={{ margin: 0 }} loading text />
                ))}
            </Detail>
          </IconDetailWrapper>
          <ProposalStatus {...statusProps} />
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
          <ProposalCardActionSummary isLoading={!proposal} />
          <ProposalCardVotes isLoading={!proposal} votes={votes} />
        </CardFooter>
      </CardWrapper>
    </UnstyledLink>
  );
};

export default ProposalCard;
