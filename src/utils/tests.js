import { ThemeProvider } from 'styled-components';
import theme from '../theme/dark.json';

import { render as rtlRender } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

export const renderWithRoutes = (ui, options = {}) => {
  //wrap with MemoryRouter
  return rtlRender(ui, { wrapper: MemoryRouter, ...options });
};

// we are mokcing testing-library/render with our own render
export const render = children => {
  //wrap with Theme
  return renderWithRoutes(
    <ThemeProvider theme={theme}> {children} </ThemeProvider>
  );
};
