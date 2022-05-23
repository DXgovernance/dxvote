import { ComponentStory, ComponentMeta } from '@storybook/react';
import GuildCard from 'Components/GuildCard/GuildCard';
import { validAddress, nullAddress } from './fixture';

export default {
  title: 'GuildCard',
  component: GuildCard,
} as ComponentMeta<typeof GuildCard>;

const Template: ComponentStory<typeof GuildCard> = args => (
  <GuildCard {...args} />
);

export const ValidAddress = Template.bind({});
ValidAddress.args = validAddress;

export const NullAddress = Template.bind({});
NullAddress.args = nullAddress;
