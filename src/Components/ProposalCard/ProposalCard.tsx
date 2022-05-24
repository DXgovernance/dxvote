import ProposalCardActionSummary from 'Components/ProposalCard/ProposalCardActionSummary';
import ProposalCardVotes from 'Components/ProposalCard/ProposalCardVotes';
import { ProposalCardProps } from 'Components/ProposalCard/types';
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
import ENSAvatar from 'Components/ENSAvatar/ENSAvatar';
import useENS from 'hooks/Guilds/ether-swr/ens/useENS';

const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  votes,
  href,
  statusProps,
  summaryActions,
}) => {
  const { name: ensName } = useENS(proposal?.creator, 1);

  console.log({ proposal, votes, href, statusProps, summaryActions });
  return (
    <UnstyledLink to={href || '#'} data-testid="proposal-card">
      <CardWrapper>
        <CardHeader>
          <IconDetailWrapper>
            <ENSAvatar address={proposal?.creator} />

            <Detail>
              {proposal?.creator ? (
                ensName || shortenAddress(proposal.creator)
              ) : (
                <Loading style={{ margin: 0 }} loading text />
              )}
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
          <ProposalCardActionSummary actions={summaryActions} />
          {votes && <ProposalCardVotes isLoading={!proposal} votes={votes} />}
        </CardFooter>
      </CardWrapper>
    </UnstyledLink>
  );
};

export default ProposalCard;
