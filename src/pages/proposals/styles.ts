import {
  Table,
  TableHeader,
  HeaderCell,
  TableRow,
  DataCell,
} from '../../old-components/common';
import styled from 'styled-components';

export const LoadingBox = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;

  .loader {
    text-align: center;
    font-weight: 500;
    font-size: 20px;
    line-height: 18px;
    color: var(--dark-text-gray);
    padding: 25px 0px;

    svg {
      margin-bottom: 10px;
    }
  }
`;

export const ProposalsWrapper = styled.div`
  padding: 10px 0px;
  background: white;
  border-radius: 4px;
  display: grid;
  grid-template-columns: 20% 80%;
  grid-gap: 10px;
`;

export const NewProposalButton = styled.div`
  align-self: center;
  margin-bottom: 100px;
`;

export const SidebarWrapper = styled.div`
  padding: 0px 10px 10px 10px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  height: calc(90vh - 20px);
  align-self: flex-start;
  position: sticky;
  top: 10%;
`;

export const ProposalTableHeaderActions = styled.div`
  padding: 20px 10px 20px 10px;
  color: var(--dark-text-gray);
  font-weight: 500;
  font-size: 18px;
  letter-spacing: 1px;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;

  span {
    font-size: 20px;
    padding: 10px 5px 5px 5px;
  }
`;

export const StyledTableRow = styled(TableRow)`
  font-size: smaller;
  padding: 16px 24px;
  color: var(--dark-text-gray);
  text-align: center;
  cursor: pointer;
  &:hover {
    ${DataCell} {
      background-color: #80808012;
    }
  }

  ${DataCell} {
    border-bottom: 1px solid var(--line-gray);
    padding: 20px 5px;
    &:nth-child(1) {
      text-align: left;
      font-size: 14px;
    }
  }
`;

export const FooterWrap = styled.div`
  align-self: flex-end;
`;

export const TableProposal = styled(Table)`
  grid-template-columns: 33% 20% 15% 20% 12%;
  margin-bottom: auto;
  overflow-y: scroll;
  max-height: calc(90vh - 20px);
  ${TableHeader} {
    ${HeaderCell} {
      background: white;
      position: sticky;
      top: 0;
    }
  }
`;

export const UnstyledAnchor = styled.a`
  color: inherit;
  text-decoration: inherit;
`;
