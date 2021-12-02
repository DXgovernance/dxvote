import styled from 'styled-components';
import { Button } from '../../common/Button';
import { VotersButton } from '../../common/VotersButton';

// TODO: investigate where the voters data is gonan come from,
// where the types are gonna sit, and which structure.

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
          <VotersButton voters={voters} />
        </Voters>
      )}
    </VotesContainer>
  );
};
