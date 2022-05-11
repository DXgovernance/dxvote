import { default as Avatar } from '.';
import { render } from '../../../utils/tests';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';

test('renders Avatar with src', async () => {
  render(<Avatar src="algo" defaultSeed={'hola'} />);
  expect(screen.queryByTestId('avatarNoSrc')).toBeNull();
});

test('renders Avatar without src', async () => {
  render(<Avatar defaultSeed={'hola'} />);
  expect(screen.queryByTestId('avatarSrc')).toBeNull();
});
