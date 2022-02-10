import { BigNumber } from 'ethers';
import { useActions } from 'hooks/Guilds/useActions';
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

const TOKEN = 'DXD';

const ProposalVoteCard = () => {
  const [showToken, setShowToken] = useState(false);
  const [action, setAction] = useState<BigNumber>();

  const { setVote } = useVotes();
  const { possibleActions } = useActions();

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
        <ProposalVotes showToken={showToken} token={TOKEN} />
        <ButtonsContainer>
          {possibleActions &&
            possibleActions.map(item => {
              return (
                <Button
                  minimal
                  active={action === BigNumber.from(item)}
                  onClick={() => {
                    setAction(BigNumber.from(item));
                  }}
                >
                  {item}
                </Button>
              );
            })}
          <Button primary disabled={!action} onClick={() => setVote(action)}>
            Vote
          </Button>
        </ButtonsContainer>
      </SidebarCardContent>
    </SidebarCard>
  );
};

export default ProposalVoteCard;
