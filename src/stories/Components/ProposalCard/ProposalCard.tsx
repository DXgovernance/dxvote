import styled from 'styled-components';
import { ProposalCardProps } from './types';
import { Box } from '../../../components/Guilds/common/Layout';
import ProposalStatus from '../../../components/Guilds/ProposalStatus';
import { Heading } from '../../../components/Guilds/common/Typography';
import 'react-loading-skeleton/dist/skeleton.css';
import UnstyledLink from '../../../components/Guilds/common/UnstyledLink';
import Avatar from '../../../components/Guilds/Avatar';
import { shortenAddress } from '../../../utils';
import { Loading } from '../../../components/Guilds/common/Loading';
import ProposalCardVotes from './ProposalCardVotes';
import ProposalCardActionSummary from './ProposalCardActionSummary';

const CardWrapper = styled(Box)`
  border: 1px solid ${({ theme }) => theme.colors.muted};
  border-radius: ${({ theme }) => theme.radii.curved};
  margin-bottom: 1rem;
  padding: 1rem;
  color: ${({ theme }) => theme.colors.proposalText.lightGrey};
  &:hover {
    border-color: ${({ theme }) => theme.colors.border.hover};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const CardHeader = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const CardContent = styled(Box)`
  margin: 1rem 0;
`;

const CardFooter = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const CardTitle = styled(Heading)`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  @media only screen and (min-width: 768px) {
    font-size: 1.25rem;
  }
`;

const IconDetailWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const Detail = styled(Box)`
  font-size: 0.95rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const ProposalStatusWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
`;

const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  votes,
  ensAvatar,
  href,
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
          <ProposalStatusWrapper>
            <ProposalStatus
              proposalId={proposal.id}
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
          <ProposalCardActionSummary isLoading={!proposal} />
          <ProposalCardVotes isLoading={!proposal} votes={votes} />
        </CardFooter>
      </CardWrapper>
    </UnstyledLink>
  );
};

export default ProposalCard;
