import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { default as Avatar } from './';
import { renderWithTheme } from '../../../utils/tests';

test('renders Avatar with src', async () => {
  renderWithTheme(<Avatar src="algo" defaultSeed={'hola'} />);
  expect(screen.queryByTestId('avatarNoSrc')).toBeNull();
});

test('renders Avatar without src', async () => {
  renderWithTheme(<Avatar defaultSeed={'hola'} />);
  expect(screen.queryByTestId('avatarSrc')).toBeNull();
});
