import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Button } from './Button';
import { themedComponent } from '../../../../utils/tests';

test('renders button', async () => {
  render(themedComponent(<Button>hola</Button>));
  fireEvent.click(screen.getByText('hola'));
});
