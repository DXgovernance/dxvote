import styled from 'styled-components';
import { useParams } from 'react-router';
import { FiCircle } from 'react-icons/fi';
import { getInfoLineView } from 'components/Guilds/ActionsBuilder/SupportedActions';
import UndecodableCallInfoLine from 'components/Guilds/ActionsBuilder/UndecodableCalls/UndecodableCallsInfoLine';

import { Box } from '../common/Layout';
import ProposalStatus from '../ProposalStatus';
import { Heading } from '../common/Typography';
import 'react-loading-skeleton/dist/skeleton.css';
import UnstyledLink from '../common/UnstyledLink';
import { useProposal } from 'hooks/Guilds/ether-swr/guild/useProposal';
import useENSAvatar from '../../../hooks/Guilds/ether-swr/ens/useENSAvatar';
import Avatar from '../Avatar';
import { MAINNET_ID } from '../../../utils/constants';
import { shortenAddress } from '../../../utils';
import { Loading } from '../common/Loading';
import useVoteSummary from 'hooks/Guilds/useVoteSummary';
import useFilteredProposalActions from './useFilteredProposalActions';

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
  align-items: flex-end;

  @media only screen and (max-width: 524px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ActionsWrapper = styled(Box)`
  display: flex;
  flex: 1;
  margin-right: 24px;
  position: relative;
  overflow-x: hidden;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: ${({ theme }) =>
      `linear-gradient(to right, transparent 89%, ${theme.colors.background} 100%)`};
  }
  & > div {
    margin: 4px 2px;
  }

  @media only screen and (max-width: 524px) {
    flex-wrap: wrap;
    border-bottom: 1px solid ${({ theme }) => theme.colors.muted};
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    & > div:nth-child(n + 3) {
      display: none;
    }
    &::before {
      content: none;
    }
  }
`;

const VoteInfoWrapper = styled(Box)`
  min-width: unset;
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
  border: 1px solid ${({ theme }) => theme.colors.border.initial};
  border-radius: 1rem;
  padding: 0.25rem 0.8rem;
  flex: none;
  display: flex;
  width: fit-content;
`;

const ProposalStatusWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
`;

const NotFoundActionWrapper = styled.div`
  display: flex;
  padding: 4px;
  border: ${({ theme }) => `1px solid ${theme.colors.red}`};
  border-radius: 30px;
`;

interface ProposalCardProps {
  id?: string;
  href?: string;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ id, href }) => {
  const { guild_id: guildId } = useParams<{ guild_id?: string }>();
  const { data: proposal } = useProposal(guildId, id);
  const votes = useVoteSummary(guildId, id);
  const { imageUrl, ensName } = useENSAvatar(proposal?.creator, MAINNET_ID);

  const actions = useFilteredProposalActions(guildId, id);

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
          <ActionsWrapper>
            {proposal?.value && actions ? (
              actions?.map(action => {
                if (!action) return null;
                const InfoLine = getInfoLineView(action?.decodedCall?.callType);

                return !!InfoLine ? (
                  <BorderedIconDetailWrapper>
                    <InfoLine
                      decodedCall={action?.decodedCall}
                      approveSpendTokens={action?.approval}
                      compact
                    />
                  </BorderedIconDetailWrapper>
                ) : (
                  <NotFoundActionWrapper>
                    <UndecodableCallInfoLine />
                  </NotFoundActionWrapper>
                );
              })
            ) : (
              <Loading
                style={{ margin: 0 }}
                skeletonProps={{ width: '200px' }}
                loading
                text
              />
            )}
          </ActionsWrapper>
          <VoteInfoWrapper>
            {proposal?.totalVotes ? (
              <BorderedIconDetailWrapper>
                {votes
                  .sort((a, b) => b - a)
                  .map((vote, i) => {
                    if (i < 3 && !(i === votes.length - 1)) {
                      return (
                        <>
                          <Detail key={i}>{vote}%</Detail>
                          <Icon as="div" spaceLeft spaceRight>
                            <FiCircle />
                          </Icon>
                        </>
                      );
                    } else {
                      return <Detail>{vote}%</Detail>;
                    }
                  })}
              </BorderedIconDetailWrapper>
            ) : (
              <Loading
                style={{ margin: 0 }}
                loading
                text
                skeletonProps={{ width: '200px' }}
              />
            )}
          </VoteInfoWrapper>
        </CardFooter>
      </CardWrapper>
    </UnstyledLink>
  );
};

export default ProposalCard;
