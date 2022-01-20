import { ThemeProvider } from 'styled-components';
import theme from '../theme/light.json';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// this mocks usePrams and router context providers.
export const renderWithRoutes = (ui, options = {}) => {
  return render(ui, { wrapper: MemoryRouter, ...options });
};

// this wraps StyledComponents theme and Router
export const renderWithTheme = children => {
  return renderWithRoutes(
    <ThemeProvider theme={theme}> {children} </ThemeProvider>
  );
};
