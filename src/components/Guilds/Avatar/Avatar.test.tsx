import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import { default as Avatar } from './';
import { themedComponent } from '../../../utils/tests';

test('renders Avatar with image', async () => {
  const { container, getByTestId } = render(
    themedComponent(
      <Avatar src="algo" defaultSeed={'hola'}>
        hola
      </Avatar>
    )
  );
  expect(getByTestId('avatarSrc')).toBeTruthy();
});
