import { Button } from '../Button';
import { Voter } from 'old-components/Guilds/ProposalPage/ProposalVoteCard';
import styled from 'styled-components';

// TODO: interface Voter is coming form ProposalVotes, may be there is a better place for reuse.

// TODO: Avatar is already defined for ENS resolution, discuss what this should be.
const Avatar = styled.img<{ index: number }>`
  width: 20px;
  height: 20px;
  margin-right: -10px;
  z-index: ${({ index }) => index * 5};
  border-radius: 50%;
  border: 2px solid white;
  object-fit: cover;
`;

const VotersButtonContainer = styled(Button)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 10px !important; // why cant overwrite?
`;

interface VotersButtonProps {
  voters: Voter[];
  toShow?: number;
}

export const VotersButton = ({ voters, toShow = 3 }: VotersButtonProps) => (
  <VotersButtonContainer>
    <span>
      {voters.slice(0, toShow).map(({ avatar }: Voter, index) => (
        <Avatar index={index} src={avatar} />
      ))}
    </span>
    {voters.length > toShow && <span>+{voters.length - toShow} Others</span>}
  </VotersButtonContainer>
);
