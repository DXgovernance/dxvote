import { ThemeProvider } from 'styled-components';
import { render as rtlRender } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GuildsDarkTheme } from 'Components/theme';

export const renderWithRoutes = (ui, options = {}) => {
  //wrap with MemoryRouter
  return rtlRender(ui, { wrapper: MemoryRouter, ...options });
};

// we are mokcing testing-library/render with our own render
export const render = (children, options = {}) => {
  //wrap with Theme
  return renderWithRoutes(
    <ThemeProvider theme={GuildsDarkTheme}> {children} </ThemeProvider>,
    options
  );
};
