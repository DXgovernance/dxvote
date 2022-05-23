import { ComponentStory, ComponentMeta } from '@storybook/react';
import GuildCard from 'Components/GuildCard/GuildCard';
import { validAddress, nullAddress } from './fixture';
import GuildCardHeader from './GuildCardHeader';
import GuildCardContent from './GuildCardContent';

export default {
  title: 'GuildCard',
  component: GuildCard,
} as ComponentMeta<typeof GuildCard>;

const Template: ComponentStory<typeof GuildCard> = args => (
  <GuildCard {...args}>
    <GuildCardHeader {...args}>Guild Card Header</GuildCardHeader>
    <GuildCardContent>Guild Card Content</GuildCardContent>
  </GuildCard>
);

export const ValidAddress = Template.bind({});
ValidAddress.args = validAddress;

export const NullAddress = Template.bind({});
NullAddress.args = nullAddress;
