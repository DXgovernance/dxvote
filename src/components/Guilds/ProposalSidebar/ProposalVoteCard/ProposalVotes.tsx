import styled from 'styled-components';
import { Button } from '../../common/Button';

interface VoteContent {
  dxd: number;
  percentage: number;
}

export interface VoteSummary {
  yes?: VoteContent;
  no?: VoteContent;
}

export interface Voter {
  avatar: string;
}

export interface ProposalVotesProps {
  voters: Voter[];
  summary: VoteSummary;
}
const VotesContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const VotesRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600px;
  margin: 5px 0px 5px 0px;
`;

const Voters = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 14px;

  ${Button} {
    padding: 5px;
  }
`;

const Avatar = styled.img`
  width: 30px;
  height: 30px;
  margin-right: -10px;
  z-index: ${({ index }) => index * 5};
  border-radius: 50%;
  border: 2px solid white;
  object-fit: cover;
`;

const VotesGraphContainer = styled.div`
  height: 5px;
  width: 100%;
  border-radius: 30px;
  border: 1px solid black;
  display: flex;
  flex: 1;
  justify-content: space-between;
  margin: 5px 0px;
`;

const VoteHalf = styled.div`
  display: flex;
  flex: 1;
`;
const VoteFill = styled.div`
  width: ${({ fill }) => (fill ? `${fill}%` : '')};
  background: black;
  border-radius: 30px;
`;

const VoteSeparator = styled.div`
  width: 1px;
  border-right: 1px solid black;
  height: 5px;
`;

const VotersButton = styled(Button)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 10px !important; // why cant overwrite?
`;

// TODO: I will move as separate reusable component when knowing well
// the data structure of the props.
const VotesGraph = ({ value }) => (
  <VotesGraphContainer>
    <VoteHalf>
      <VoteFill fill={value} />
    </VoteHalf>
    <VoteSeparator />
    <VoteHalf></VoteHalf>
  </VotesGraphContainer>
);

export const ProposalVotes = ({ summary, voters }: ProposalVotesProps) => {
  //--- TODO: this may change when we know structure of real data
  const { yes, no } = summary;
  const total = yes?.dxd + no?.dxd;
  const pYes = Math.round((yes.dxd / total) * 100);
  const pNo = Math.round((no.dxd / total) * 100);
  //---

  return (
    <VotesContainer>
      {yes && (
        <>
          <VotesRow>
            <span>Yes &middot; {yes.dxd} DXD</span>
            <span>{pYes}%</span>
          </VotesRow>
          <VotesGraph value={pYes} />
        </>
      )}
      {no && (
        <>
          <VotesRow>
            <span>No &middot; {no.dxd} DXD</span>
            <span>{pNo}%</span>
          </VotesRow>
          <VotesGraph value={pNo} />
        </>
      )}

      {voters && (
        <Voters>
          <p>Voted by</p>
          <VotersButton>
            <span>
              {voters.map(({ avatar }: Voter, index) => (
                <Avatar index={index} src={avatar} />
              ))}
            </span>
            <span> +33 Others</span>
          </VotersButton>
        </Voters>
      )}
    </VotesContainer>
  );
};
