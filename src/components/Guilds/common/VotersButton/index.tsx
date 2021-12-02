import styled from 'styled-components';
import { Button } from '../Button';
import { Voter } from '../../ProposalSidebar/ProposalVoteCard/ProposalVotes';

// TODO: interface Voter is coming form ProposalVotes, may be there is a better place for reuse.

const Avatar = styled.img`
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
}

export const VotersButton = ({ voters }: VotersButtonProps) => (
  <VotersButtonContainer>
    <span>
      {voters.map(({ avatar }: Voter, index) => (
        <Avatar index={index} src={avatar} />
      ))}
    </span>
    <span> +33 Others</span>
  </VotersButtonContainer>
);
