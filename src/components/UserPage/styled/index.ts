import styled from 'styled-components';

export const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const ListRow = styled.div`
  display: flex;
  alignitems: center;
  padding: 6px 0px;
  borderbottom: ${({ borderBottom }) => (borderBottom ? '1px solid' : '')};
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  &:hover {
    opacity: ${({ clickable }) => (clickable ? '0.5' : '1')};
  }
`;
