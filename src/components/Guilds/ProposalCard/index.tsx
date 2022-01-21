import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';

import { useParams } from 'react-router';
import { isDesktop } from 'react-device-detect';
import { FiArrowRight, FiCircle } from 'react-icons/fi';

import { Box } from '../common/Layout';
import dxIcon from '../../../assets/images/ether.svg';
import ProposalStatus from '../ProposalStatus';
import { Heading } from '../common/Typography';
import 'react-loading-skeleton/dist/skeleton.css';
import UnstyledLink from '../common/UnstyledLink';
import { useProposal } from 'hooks/Guilds/useProposal';

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
  id: any;
  href: string;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ id, href }) => {
  const { guild_id: guildId } = useParams<{ guild_id?: string }>();
  const { data } = useProposal(guildId, id);
  const { title, contentHash } = data || {
    title: '',
    description: '',
  };

  return (
    <UnstyledLink to={href}>
      <CardWrapper>
        <CardHeader>
          <IconDetailWrapper>
            <Icon src={dxIcon} spaceRight />
            <Detail>Swapr von 0x01Cf...2712</Detail>
          </IconDetailWrapper>
          <ProposalStatusWrapper>
            <ProposalStatus
              proposal={data}
              bordered={false}
              showRemainingTime
            />
          </ProposalStatusWrapper>
        </CardHeader>
        <CardContent>
          <CardTitle size={2}>
            <strong>{title}</strong>
          </CardTitle>
          <p>{contentHash}</p>
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

const Flex = styled.div`
  display: Flex;
  flex-direction: column;
  justify-content: center;
`;

export const SkeletonProposalCard: React.FC = () => {
  return (
    <CardWrapper>
      <CardHeader>
        <IconDetailWrapper>
          <Flex style={{ marginRight: '8px' }}>
            <Skeleton circle width="24px" height="24px" borderRadius="32px" />
          </Flex>
          <Flex>
            <Skeleton
              width="90px"
              height="12px"
              borderRadius="32px"
              style={{ marginTop: '8px' }}
            />
          </Flex>
        </IconDetailWrapper>
        <ProposalStatusWrapper>
          <Flex>
            <Skeleton
              width="30px"
              height="12px"
              borderRadius="32px"
              style={{ marginRight: '8px' }}
            />
          </Flex>
          <Flex>
            <Skeleton width="60px" height="32px" borderRadius="32px" />
          </Flex>
        </ProposalStatusWrapper>
      </CardHeader>
      <CardContent>
        <Skeleton width="100%" height="12px" borderRadius="32px" />
        <CardContent>
          <Skeleton width="100%" height="40px" borderRadius="32px" />
        </CardContent>
      </CardContent>
      <CardFooter>
        <Skeleton width="200px" height="30px" borderRadius="32px" />
        <Skeleton width="200px" height="30px" borderRadius="32px" />
      </CardFooter>
    </CardWrapper>
  );
};

export default ProposalCard;
