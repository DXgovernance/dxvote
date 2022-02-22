import { BigNumber } from 'ethers';
import { useProposal } from 'hooks/Guilds/ether-swr/guild/useProposal';
import { useVotes } from 'hooks/Guilds/useVotes';
import { useState } from 'react';
import { useParams } from 'react-router';
import styled from 'styled-components';
import { Button } from '../../common/Button';
import { Box } from '../../common/Layout';
import moment from 'moment';

import SidebarCard from '../../SidebarCard';
import { ProposalVotes } from './ProposalVotes';

const SidebarCardHeader = styled(Box)`
  padding: 1rem;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
`;

const SidebarCardContent = styled(Box)`
  padding: 1rem;
  color: ${({ theme }) => theme.colors.text};
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

const ProposalVoteCard = () => {
  const [showToken, setShowToken] = useState(false);
  const [action, setAction] = useState<BigNumber>();

  const { setVote, voteData } = useVotes();

  const { guild_id: guildId, proposal_id: proposalId } =
    useParams<{ guild_id?: string; proposal_id?: string }>();
  const { data: proposal } = useProposal(guildId, proposalId);

  const TOKEN = voteData?.token?.symbol;

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
        {!proposal?.endTime.isBefore(moment()) && voteData?.args && (
          <ButtonsContainer>
            {Object.keys(voteData?.args).map(item => {
              const bItem = BigNumber.from(item);
              return (
                <Button
                  minimal
                  active={action && (action.eq(bItem) ? true : false)}
                  onClick={() => {
                    setAction(bItem);
                  }}
                >
                  {'Action ' + item}
                </Button>
              );
            })}

            <Button primary disabled={!action} onClick={() => setVote(action)}>
              Vote
            </Button>
          </ButtonsContainer>
        )}
      </SidebarCardContent>
    </SidebarCard>
  );
};

export default ProposalVoteCard;
