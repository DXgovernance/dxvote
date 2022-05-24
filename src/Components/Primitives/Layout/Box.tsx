import styled from 'styled-components';

export const Box = styled.div<{
  margin?: number | string;
  padding?: number | string;
}>`
  box-sizing: 'border-box';
  min-width: 0;
  margin: ${({ margin }) => (margin ? margin : '0')};
  padding: ${({ padding }) => (padding ? padding : '0')};
`;

export const Circle = styled.div<{ size?: number }>`
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  height: ${({ size }) => (size ? size : '86px')};
  width: ${({ size }) => (size ? size : '86px')};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Flex = styled.div<{
  direction?: string;
  justifyContent?: string;
  alignItems?: string;
  margin?: number | string;
  padding?: number | string;
}>`
  display: Flex;
  flex-direction: ${({ direction }) => (direction ? direction : 'column')};
  justify-content: ${({ justifyContent }) =>
    justifyContent ? justifyContent : 'center'};
  align-items: ${({ alignItems }) => (alignItems ? alignItems : 'center')};
  text-align: center;
  border-radius: ${({ theme }) => theme.radii.curved};
  margin: ${({ margin }) => (margin ? margin : '0')};
  padding: ${({ padding }) => (padding ? padding : '0')};
`;
