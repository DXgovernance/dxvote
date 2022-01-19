import { fireEvent, screen } from '@testing-library/react';
import { Button } from './Button';
import { renderWithTheme } from '../../../../utils/tests';

test('renders button', async () => {
  renderWithTheme(<Button>hola</Button>);
  fireEvent.click(screen.getByText('hola'));
});
