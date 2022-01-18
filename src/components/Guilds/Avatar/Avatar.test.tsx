import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { default as Avatar } from './';
import { themedComponent } from '../../../utils/tests';

test('renders Avatar with src', async () => {
  render(themedComponent(<Avatar src="algo" defaultSeed={'hola'} />));
  expect(screen.queryByTestId('avatarSrc')).toBeTruthy();
  expect(screen.queryByTestId('avatarNoSrc')).toBeNull();
});

test('renders Avatar without src', async () => {
  render(themedComponent(<Avatar defaultSeed={'hola'} />));
  expect(screen.queryByTestId('avatarSrc')).toBeNull();
});
