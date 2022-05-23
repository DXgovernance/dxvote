import { createGlobalStyle } from 'styled-components';
import { GuildsTheme } from 'Components/theme';

const GlobalStyle = createGlobalStyle<{ theme: GuildsTheme }>`
  body {
    margin: 0;
    padding: 0;
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
    font-family: ${({ theme }) => theme.fonts.body};
    font-weight: ${({ theme }) => theme.fontWeights.regular};
    line-height: ${({ theme }) => theme.lineHeights.body};
    font-size: ${({ theme }) => theme.fontSizes.body};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  strong, b {
    font-weight: ${({ theme }) => theme.fontWeights.medium};
  }

  code {
    font-family: ${({ theme }) => theme.fonts.monospace};
  }

  button {
    font-family: ${({ theme }) => theme.fonts.body};
    font-weight: ${({ theme }) => theme.fontWeights.regular};
  }
  `;

export default GlobalStyle;
