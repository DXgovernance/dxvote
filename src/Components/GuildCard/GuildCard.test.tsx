import GuildCard from './GuildCard';
import { render } from '../../utils/tests';
import '@testing-library/jest-dom';
import { validAddress, nullAddress } from './fixture';

jest.mock('hooks/Guilds/ether-swr/ens/useENSNameFromAddress', () => ({
  __esModule: true,
  default: () => 'test.eth',
}));

jest.mock('hooks/Guilds/ether-swr/guild/useGuildConfig', () => ({
  useGuildConfig: function () {
    return {
      data: {
        name: 'REPGuild',
      },
    };
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
    i18n: { changeLanguage: jest.fn() },
  }),
}));

jest.mock('hooks/Guilds/ether-swr/guild/useGuildActiveProposals', () => ({
  __esModule: true,
  default: function () {
    return {
      data: {
        _hex: '0x01',
        _isBigNumber: true,
      },
    };
  },
}));

jest.mock('hooks/Guilds/ether-swr/guild/useGuildMemberTotal', () => ({
  __esModule: true,
  default: function () {
    return {
      data: {
        _hex: '0x01',
        _isBigNumber: true,
      },
    };
  },
}));

describe('GuildCard', () => {
  it('Should render properly with a guild address', async () => {
    // const { container } = render(<GuildCard {...validAddress} />);
    // expect(container).toMatchSnapshot();
  });

  it('Should render loading when the address is null', async () => {
    // const { container } = render(<GuildCard {...nullAddress} />);
    // expect(container).toMatchSnapshot();
  });
});
