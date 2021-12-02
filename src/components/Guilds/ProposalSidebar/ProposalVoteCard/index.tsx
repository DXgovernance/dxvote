import styled from 'styled-components';
import { Button } from '../../common/Button';
import { Box } from '../../common/Layout';

import SidebarCard from '../../SidebarCard';
import { ProposalVotes, VoteSummary, Voter } from './ProposalVotes';

// avatar examples
import dxIcon from '../../../../assets/images/dxdao-icon.svg';
import etherIcon from '../../../../assets/images/ether.svg';
import metaIcon from '../../../../assets/images/metamask.png';

const SidebarCardHeader = styled(Box)`
  padding: 1rem;
  font-weight: 600;
`;

const SidebarCardContent = styled(Box)`
  padding: 1rem;
`;

const VoteButton = styled(Button)`
  margin-top: 1rem;
  display: block;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.background};

  &:hover:enabled {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ProposalVoteCard = () => {
  const votes: VoteSummary = {
    yes: { dxd: 253, percentage: 80 },
    no: { dxd: 12, percentage: 10 },
  };
  const voters: Voter[] = [
    { avatar: dxIcon },
    { avatar: etherIcon },
    { avatar: metaIcon },
  ];
  return (
    <SidebarCard header={<SidebarCardHeader>Cast your vote</SidebarCardHeader>}>
      <SidebarCardContent>
        <ProposalVotes summary={votes} voters={voters} />
        <VoteButton>Vote</VoteButton>
      </SidebarCardContent>
    </SidebarCard>
  );
};

export default ProposalVoteCard;
