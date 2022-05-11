import styled from 'styled-components';

export const Table = styled.table`
  display: grid;
  border-collapse: collapse;
`;

export const TableHeader = styled.thead`
  display: contents;
  color: var(--light-text-gray);
  font-size: 14px;
`;

interface HeaderCellProps {
  align?: string;
}

export const HeaderCell = styled.th<HeaderCellProps>`
  text-align: ${props => props.align};
  padding: 10px 4px;
`;

export const TableRow = styled.tr`
  font-size: 16px;
  line-height: 18px;
  color: var(--dark-text-gray);
  text-align: center;
  cursor: pointer;
  display: contents;
`;

export const TableBody = styled.tbody`
  display: contents;
`;

interface DataCellProps {
  color?: string;
  align?: string;
  weight?: string;
  wrapText?: boolean;
}
export const DataCell = styled.td<DataCellProps>`
  color: ${props => props.color};
  text-align: ${props => props.align};
  font-weight: ${props => props.weight};
  white-space: ${props => (props.wrapText ? 'nowrap' : 'inherit')};
  overflow: ${props => (props.wrapText ? 'hidden' : 'inherit')};
  text-overflow: ellipsis;
  border-bottom: 1px solid var(--line-gray);
  padding: 14px;

  a {
    text-decoration: none;
    width: 100%;

    &:hover {
      color: var(--turquois-text-onHover);
    }
  }
`;
