import GuildCard from './GuildCard';
import GuildCardHeader from './GuildCardHeader';
import GuildCardContent from './GuildCardContent';
import { render } from '../../utils/tests';
import '@testing-library/jest-dom';
import { GuildCardProps } from './types';

const validAddress: GuildCardProps = {
  guildAddress: '0xa47BbE8Dd6dB29D45FE5eeD838c4f136884AEAF3',
};

const nullAddress: GuildCardProps = {
  guildAddress: null,
};

test('Guild Card renders properly with a guild address', async () => {
  const { container } = render(
    <GuildCard {...validAddress}>
      <GuildCardHeader></GuildCardHeader>
      <GuildCardContent></GuildCardContent>
    </GuildCard>
  );

  expect(container).toMatchSnapshot();
});

test('Guild Card renders properly with a null guild address', async () => {
  const { container } = render(
    <GuildCard {...nullAddress}>
      <GuildCardHeader></GuildCardHeader>
      <GuildCardContent></GuildCardContent>
    </GuildCard>
  );

  expect(container).toMatchSnapshot();
});
