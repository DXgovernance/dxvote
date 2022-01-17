import styled from 'styled-components';

export const Box = styled.div`
  box-sizing: 'border-box';
  min-width: 0;
`;

export const Circle = styled.div`
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  height: 86px;
  width: 86px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Flex = styled.div`
  display: Flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: ${({ theme }) => theme.colors.background};

  border-radius: ${({ theme }) => theme.radii.curved2};
`;
