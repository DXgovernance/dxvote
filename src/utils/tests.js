import { ThemeProvider } from 'styled-components';
import theme from '../theme/light.json';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// this could be used to not mock usePrams.
export const renderWithRoutes = (ui, options = {}) => {
  return render(ui, { wrapper: MemoryRouter, ...options });
};

export const renderWithTheme = children => {
  return renderWithRoutes(
    <ThemeProvider theme={theme}> {children} </ThemeProvider>
  );
};
