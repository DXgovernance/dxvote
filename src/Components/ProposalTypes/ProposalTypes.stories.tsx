import { ComponentStory, ComponentMeta } from '@storybook/react';
import ProposalTypes from 'Components/ProposalTypes/ProposalTypes';
import { testProps } from './fixtures';

export default {
  title: 'Components/ProposalTypes',
  component: ProposalTypes,
  //   argTypes: {},
} as ComponentMeta<typeof ProposalTypes>;

const Template: ComponentStory<typeof ProposalTypes> = args => (
  <ProposalTypes {...args} />
);

export const Default = Template.bind({});
Default.args = testProps;
Default.storyName = 'ProposalTypes';
