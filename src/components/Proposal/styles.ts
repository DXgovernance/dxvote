import styled from 'styled-components';

export const TextCenter = styled.div`
  text-align: center;
`;

export const ActionArea = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SidebarRow = styled.div`
  display: flex;
  justify-content: space-around;
  flex-direction: row;
  padding: 5px 0px;

  .timeText {
    font-size: 20;
    margin-left: -10px;
    width: 100%;
    text-align: center;
    padding-top: 5px;
  }

  span {
    margin-bottom: 5px;
  }
`;

export const Vote = styled.div`
  display: flex;
  font-size: ${({ theme }) => theme.votes.fontSize};
  justify-content: space-between;

  > * {
    margin-left: 4px;
  }
`;

export const AmountInput = styled.input`
  background-color: white;
  border: 1px solid gray;
  border-radius: 4px;
  height: 34px;
  letter-spacing: 1px;
  font-weight: 500;
  line-height: 32px;
  text-align: left;
  cursor: pointer;
  width: 60px;
  padding: 0px 10px;
  margin: 5px;
  font-family: var(--roboto);
`;

export const Summary = styled.div``;

export const PositiveSummary = styled(Summary)`
  color: ${({ theme }) => theme.votes.positive.color};
`;

export const NegativeSummary = styled(Summary)`
  color: ${({ theme }) => theme.votes.negative.color};
`;

export const SummaryTotal = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
`;
export const SummaryDetails = styled.div`
  font-size: 13px;
  flex: 1;
`;

export const ActionButton = styled.div`
  background-color: ${props => props.color || '#536DFE'};
  border-radius: 4px;
  color: white;
  height: 34px;
  width: max-content;
  letter-spacing: 1px;
  font-weight: 500;
  line-height: 34px;
  text-align: center;
  cursor: pointer;
  padding: 0px 10px;
  margin: 5px;

  display: flex;
  align-items: center;

  svg {
    margin-right: 4px;
  }
`;
