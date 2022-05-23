import React from 'react';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/dark.json';
import GlobalStyle from 'theme/GlobalTheme';
import MultichainProvider from 'contexts/MultichainProvider/index';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

const ComponentContainer = ({ children }) => (
  <ThemeProvider theme={theme}>
    <HashRouter basename="/">
      <MultichainProvider>
        {children}
        <GlobalStyle />
      </MultichainProvider>
    </HashRouter>
  </ThemeProvider>
);

export const decorators = [
  Story => (
    <ComponentContainer>
      <Story />
    </ComponentContainer>
  ),
];

