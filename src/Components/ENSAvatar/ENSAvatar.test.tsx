import '@testing-library/jest-dom';
import { ZERO_ADDRESS } from 'utils';
import { render } from '../../utils/tests';

import ENSAvatar from './ENSAvatar';

const testImage = '/image/test.jpg';

jest.mock('hooks/Guilds/ether-swr/ens/useENSAvatar', (address?: string) => {
  return {
    __esModule: true,
    default: () => ({
      imageUrl: address ? testImage : null,
    }),
  };
});

describe('ENSAvatar', () => {
  it('Should render avatar when address is given', () => {
    const { container } = render(<ENSAvatar address={ZERO_ADDRESS} />);
    expect(container).toMatchSnapshot();
  });

  it('Should render skeleton when address is not given', () => {
    const { container } = render(<ENSAvatar />);
    expect(container).toMatchSnapshot();
  });
});
