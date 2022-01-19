import { ThemeProvider } from 'styled-components';
import theme from '../theme/light.json';

import { render } from '@testing-library/react';

export const renderWithTheme = children => {
  return render(<ThemeProvider theme={theme}> {children} </ThemeProvider>);
};
