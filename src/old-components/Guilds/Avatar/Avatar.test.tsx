import { render } from '../../../utils/tests';
import { screen } from '@testing-library/react';

import Avatar from './';

describe('Avatar', () => {
  it('Should render image when src is given', () => {
    const { container } = render(
      <Avatar src="/test/image.png" defaultSeed="test-image-seed" />
    );
    expect(container).toMatchSnapshot();
    expect(screen.queryByTestId('avatar')).toBeInTheDocument();
    expect(screen.queryByTestId('avatar')).toHaveAttribute(
      'src',
      '/test/image.png'
    );
    expect(screen.queryByTestId('avatar')).toHaveAttribute('size', '24');
  });

  it('Should render image with a given size', () => {
    render(
      <Avatar src="/test/image.png" defaultSeed="test-image-seed" size={16} />
    );
    expect(screen.queryByTestId('avatar')).toHaveAttribute('size', '16');
  });

  it('Should render Jazzicon when no src is given', () => {
    const { container } = render(<Avatar defaultSeed="test-image-seed" />);
    expect(container).toMatchSnapshot();
    expect(screen.queryByTestId('avatar')).not.toBeInTheDocument();
  });
});
