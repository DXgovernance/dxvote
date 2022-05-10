import { fireEvent, screen } from '@testing-library/react';
import { render } from '../../../../utils/tests';

import { Button } from './Button';

test('renders button', async () => {
  render(<Button>hola</Button>);
  fireEvent.click(screen.getByText('hola'));
});
