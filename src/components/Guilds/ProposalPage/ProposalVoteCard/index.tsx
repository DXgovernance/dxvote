import { BigNumber } from 'ethers';
import { useProposal } from 'hooks/Guilds/ether-swr/guild/useProposal';
import { useVotes } from 'hooks/Guilds/useVotes';
import { useState, useMemo } from 'react';
import { useParams } from 'react-router';
import styled from 'styled-components';
import { Button } from '../../common/Button';
import moment from 'moment';

import SidebarCard, {
  SidebarCardContent,
  SidebarCardHeader,
} from '../../SidebarCard';
import { ProposalVotes } from './ProposalVotes';
import useTimedRerender from 'hooks/Guilds/time/useTimedRerender';

const SidebarCardHeaderSpaced = styled(SidebarCardHeader)`
  display: flex;
  justify-content: space-between;
`;

const ButtonsContainer = styled.div`
  flex-direction: column;
  display: flex;
  margin-top: 2.5rem;
`;

const SmallButton = styled(Button)`
  margin: 0px;
  padding: 0.1rem 0.4rem;
  width: 60px;
`;

const ProposalVoteCard = () => {
  const [showToken, setShowToken] = useState(false);
  const [action, setAction] = useState<BigNumber>();

  const { setVote, voteData } = useVotes();

  const { guild_id: guildId, proposal_id: proposalId } =
    useParams<{ guild_id?: string; proposal_id?: string }>();
  const { data: proposal } = useProposal(guildId, proposalId);

  const TOKEN = voteData?.token?.symbol;

  const timestamp = useTimedRerender(1000);
  const isOpen = useMemo(
    () => proposal?.endTime.isAfter(moment(timestamp)),
    [proposal, timestamp]
  );

  return (
    <SidebarCard
      header={
        <SidebarCardHeaderSpaced>
          {isOpen ?  "Cast your vote" : "Vote results"}
          <SmallButton
            variant="secondary"
            onClick={() => setShowToken(!showToken)}
          >
            {showToken ? TOKEN : '%'}
          </SmallButton>
        </SidebarCardHeaderSpaced>
      }
    >
      <SidebarCardContent>
        <ProposalVotes showToken={showToken} token={TOKEN} />
        {isOpen && voteData?.args && (
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
