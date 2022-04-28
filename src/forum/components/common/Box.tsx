import styled from 'styled-components';

const getSpacing = (val, { spacing }) =>
  spacing[Math.abs(val)] * (val / Math.abs(val)) || 0;

// Define a standard box with helpers for spacing - Many component libraries such as ChakraUI and ThemeUI use this. Tailwind has similar convention.
export const Box = styled.div`
  margin: ${({ m = 0, theme }) => getSpacing(m, theme)}px;
  margin-left: ${({ ml = 0, mx = 0, theme }) => getSpacing(ml || mx, theme)}px;
  margin-right: ${({ mr = 0, mx = 0, theme }) => getSpacing(mr || mx, theme)}px;
  margin-top: ${({ mt = 0, theme }) => getSpacing(mt, theme)}px;
  margin-bottom: ${({ mb = 0, theme }) => getSpacing(mb, theme)}px;
  padding: ${({ p = 0, theme }) => getSpacing(p, theme)}px;
  padding-left: ${({ pl = 0, px = 0, theme }) => getSpacing(pl || px, theme)}px;
  padding-right: ${({ pr = 0, px = 0, theme }) =>
    getSpacing(pr || px, theme)}px;
  padding-top: ${({ py = 0, theme }) => getSpacing(py, theme)}px;
  padding-bottom: ${({ py = 0, theme }) => getSpacing(py, theme)}px;
  height: ${({ height }) => height || 'auto'};
  flex: ${({ flex }) => flex || 'initial'};
`;
export const Text = styled(Box)`
  display: inline;
  color: ${({ theme, color }) => theme.colors[color] || 'inherit'};
`;
export const Flex = styled(Box)`
  display: flex;
  align-items: ${({ alignItems }) => alignItems || 'initial'};
  justify-content: ${({ justifyContent }) => justifyContent || 'initial'};
`;
