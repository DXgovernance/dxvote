import styled from 'styled-components';

export const Box = styled.div`
  border: 1px solid #e1e3e7;
  padding: ${({noPadding}) => noPadding ? '0px' : '10px 0px'};
  background: white;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.borderStyle};
  ${({centered}) => centered && `align-items: center;`}
`;

