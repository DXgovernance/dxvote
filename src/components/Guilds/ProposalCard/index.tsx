import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router';
import { isDesktop } from 'react-device-detect';
import { FiArrowRight, FiCircle } from 'react-icons/fi';

import { Box } from '../common/Layout';
import ProposalStatus from '../ProposalStatus';
import { Heading } from '../common/Typography';
import 'react-loading-skeleton/dist/skeleton.css';
import UnstyledLink from '../common/UnstyledLink';
import { useProposal } from 'hooks/Guilds/ether-swr/useProposal';
import useENSAvatar from '../../../hooks/Guilds/ens/useENSAvatar';
import Avatar from '../Avatar';
import { DEFAULT_ETH_CHAIN_ID } from '../../../provider/connectors';
import { shortenAddress } from '../../../utils';

const CardWrapper = styled(Box)`
  border: 1px solid ${({ theme }) => theme.colors.muted};
  border-radius: ${({ theme }) => theme.radii.curved};
  margin-bottom: 1rem;
  padding: 1rem;
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

const Icon = styled.img<{
  spaceLeft?: boolean;
  spaceRight?: boolean;
  bordered: boolean;
}>`
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;

  ${props => props.spaceLeft && `margin-left: 0.5rem;`}
  ${props => props.spaceRight && `margin-right: 0.5rem;`}

  ${props =>
    props.bordered &&
    `
    border: 1px solid #000;
    border-radius: 50%;
  `}
`;

const BorderedIconDetailWrapper = styled(IconDetailWrapper)`
  border: 1px solid #000;
  border-radius: 1rem;
  padding: 0.25rem 0.8rem;
  flex: none;
  display: flex;
`;

const ProposalStatusWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
`;

interface ProposalCardProps {
  id?: string;
  href?: string;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ id, href }) => {
  const { guild_id: guildId } = useParams<{ guild_id?: string }>();
  const { data: proposal } = useProposal(guildId, id);
  const { imageUrl, ensName } = useENSAvatar(
    proposal?.creator,
    DEFAULT_ETH_CHAIN_ID
  );

  return (
    <UnstyledLink to={href || '#'}>
      <CardWrapper>
        <CardHeader>
          <IconDetailWrapper>
            {proposal?.creator ? (
              <Avatar src={imageUrl} defaultSeed={proposal.creator} size={24} />
            ) : (
              <Skeleton test-id="skeleton" circle width={24} height={24} />
            )}
            <Detail>
              {ensName ||
                (proposal?.creator ? (
                  shortenAddress(proposal.creator)
                ) : (
                  <Skeleton width={100} />
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
            <strong>{proposal?.title || <Skeleton />}</strong>
          </CardTitle>
        </CardContent>
        <CardFooter>
          <BorderedIconDetailWrapper>
            <Detail>150 ETH</Detail>
            {isDesktop && (
              <>
                <Icon as="div" spaceLeft spaceRight>
                  <FiArrowRight />
                </Icon>{' '}
                <Detail>geronimo.eth</Detail>
              </>
            )}
          </BorderedIconDetailWrapper>
          <BorderedIconDetailWrapper>
            <Detail>15.60%</Detail>
            <Icon as="div" spaceLeft spaceRight>
              <FiCircle />
            </Icon>
            <Detail>5.25%</Detail>
          </BorderedIconDetailWrapper>
        </CardFooter>
      </CardWrapper>
    </UnstyledLink>
  );
};

export default ProposalCard;
