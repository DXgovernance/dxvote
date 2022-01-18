import { ThemeProvider } from 'styled-components';
import theme from '../theme/light.json';

export const themedComponent = children => (
  <ThemeProvider theme={theme}> {children} </ThemeProvider>
);
