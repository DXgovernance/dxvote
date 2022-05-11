import styled from 'styled-components';

export const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const ListRow = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 0px;
  border-bottom: ${({ borderBottom }) => (borderBottom ? '1px solid' : '')};
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  &:hover {
    opacity: ${({ clickable }) => (clickable ? '0.5' : '1')};
  }
`;
