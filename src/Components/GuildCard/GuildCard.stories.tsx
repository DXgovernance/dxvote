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

const TemplateLoading: ComponentStory<typeof GuildCard> = args => (
  <>
    <GuildCard {...args} />
    <GuildCard {...args} />
    <GuildCard {...args} />
  </>
);

export const Simple = Template.bind({});
Simple.args = validAddress;

export const Loading = TemplateLoading.bind({});
Loading.args = nullAddress;
