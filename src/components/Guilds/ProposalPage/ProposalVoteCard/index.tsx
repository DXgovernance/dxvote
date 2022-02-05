import { BigNumber } from 'ethers';
import { useVotes } from 'hooks/Guilds/useVotes';
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

const ButtonsContainer = styled.div`
  flex-direction: column;
  display: flex;
  margin-top: 30px;
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
// pull data about proposal votes
// iterate over array to create different action buttons
const ProposalVoteCard = () => {
  const [showToken, setShowToken] = useState(false);
  const [voted, setVoted] = useState('');

  const ZERO: BigNumber = BigNumber.from(0);

  const [action, setAction] = useState<BigNumber>(ZERO);

  const { setVote } = useVotes();

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
        <ButtonsContainer>
          <Button
            minimal
            active={voted === 'yes'}
            onClick={() => {
              setVoted('yes');
              setAction(BigNumber.from(1));
            }}
          >
            Yes
          </Button>
          <Button
            minimal
            active={voted === 'no'}
            onClick={() => {
              setVoted('no');
              setAction(ZERO);
            }}
          >
            No
          </Button>
          <Button primary disabled={!voted} onClick={() => setVote(action)}>
            Vote
          </Button>
        </ButtonsContainer>
      </SidebarCardContent>
    </SidebarCard>
  );
};

export default ProposalVoteCard;
