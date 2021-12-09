import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../common/Button';
import { Box } from '../../common/Layout';

import SidebarCard from '../../SidebarCard';
import { ProposalVotes } from './ProposalVotes';

const SidebarCardHeader = styled(Box)`
  padding: 1rem;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const SmallButton = styled(Button)`
  margin: 0px;
  padding: 2px 6px;
`;

// TODO: remove this when subscribing to real data:
const voteData = {
  yes: 124.5,
  no: 234.76,
  quorum: 40,
  totalLocked: 670,
};
const TOKEN = 'DXD';
//
const ProposalVoteCard = () => {
  const [showToken, setShowToken] = useState(false);

  return (
    <SidebarCard
      header={
        <SidebarCardHeader>
          Cast your vote{' '}
          <SmallButton primary onClick={() => setShowToken(!showToken)}>
            {showToken ? TOKEN : '%'}
          </SmallButton>
        </SidebarCardHeader>
      }
    >
      <SidebarCardContent>
        <ProposalVotes
          voteData={voteData}
          showToken={showToken}
          token={TOKEN}
        />
        <VoteButton>Vote</VoteButton>
      </SidebarCardContent>
    </SidebarCard>
  );
};

export default ProposalVoteCard;
