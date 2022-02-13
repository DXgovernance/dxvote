import styled from 'styled-components';
import { FaFlagCheckered } from 'react-icons/fa';
import { useVotes } from 'hooks/Guilds/useVotes';
import { formatUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';

const VotesChartContainer = styled.div`
  display: flex;
  position: relative;
  flex: 1;
  flex-direction: column;
  margin: 10px 0px 40px 0px;
  width: 100%;
`;

const VotesChartRow = styled.div`
  display: flex;
  flex: 1;
  height: 12px;
  border-radius: 30px;
  border: 1px solid black;
  overflow: hidden;
`;

const VoteFill = styled.div`
  width: ${({ fill }) => (fill ? `${fill}%` : '')};
  background: ${({ type, theme }) => theme.colors.votes[type].bg};
  height: 12px;
  overflow: hidden;
`;

// The margin top and height are different when quorum 0 or 100,
// becase the border radious of the container, the marker needs to touch the curved line.
const VoteQuorumMarker = styled.div`
  height: ${({ quorum }) =>
    quorum === 0 || quorum === 100 ? '18px;' : '14px;'};
  margin-top: ${({ quorum }) =>
    quorum === 0 || quorum === 100 ? '10px;' : '14px;'};
  width: 1px;
  background: black;
`;

const VoteQuorumLabel = styled.div`
  padding: 4px 8px;
  border: 1px solid black;
  border-radius: ${({ quorum, theme }) =>
    quorum < 10
      ? `0px ${theme.radii.curved} ${theme.radii.curved}`
      : quorum > 90
      ? `${theme.radii.curved} 0px ${theme.radii.curved} ${theme.radii.curved}`
      : `${theme.radii.curved}`};
  font-size: 14px;
  font-weight: 600;
  align-items: center;
  display: flex;

  span {
    margin-left: 2px;
  }
`;

// If quorum <10, we align to left the marker and label, and left position of container is quorum.
// if 10 < quorum < 90, we left position the container at the quorum - the half of the width of the label, centered flex.
// quorum > 90, we align the container at the quorum - the full width of the label, right alignment label and marker.
const VoteQuorumContainer = styled.div`
  width: 65px;
  position: absolute;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: ${({ quorum }) =>
    quorum < 10 ? 'flex-start' : quorum > 90 ? 'flex-end' : 'center'};
  left: ${({ quorum }) =>
    quorum < 10
      ? `${quorum}%`
      : quorum > 90
      ? `calc(${quorum}% - 65px)`
      : `calc(${quorum}% - 22px)`};
`;

//TODO: define types when structure of voteData is well defined
export const VotesChart = ({ showToken, token }) => {
  const {
    voteData: { quorum, args },
    flagCheckered,
  } = useVotes();

  const nQuorum = formatUnits(BigNumber.from(quorum.toString()));

  return (
    <VotesChartContainer>
      <VotesChartRow>
        {Object.values(args).map((item, i) => {
          return <VoteFill fill={item[i][1]} type="yes" />;
        })}
      </VotesChartRow>
      <VoteQuorumContainer quorum={nQuorum}>
        <VoteQuorumMarker quorum={nQuorum} />
        <VoteQuorumLabel quorum={nQuorum}>
          <FaFlagCheckered />
          <span>{showToken ? nQuorum : flagCheckered}</span>
          <span>{showToken ? token : '%'}</span>
        </VoteQuorumLabel>
      </VoteQuorumContainer>
    </VotesChartContainer>
  );
};
