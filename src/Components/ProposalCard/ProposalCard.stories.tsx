import { ComponentStory, ComponentMeta } from '@storybook/react';
import ProposalCard from 'Components/ProposalCard/ProposalCard';
import { ProposalCardProps } from 'Components/ProposalCard/types';
import { proposalStatusMock } from 'Components/ProposalStatus/fixtures';
import { ensAvatarMock, proposalMock } from '../Fixtures';

export default {
  title: 'Proposals/ProposalCard',
  component: ProposalCard,
  argTypes: {
    href: {
      description: 'URL to open on click',
    },
    votes: {
      description: 'Array of vote percentages for each option',
    },
  },
} as ComponentMeta<typeof ProposalCard>;

const proposalCardArgs: ProposalCardProps = {
  proposal: proposalMock,
  ensAvatar: ensAvatarMock,
  href: '/',
  votes: [11, 1],
  statusProps: proposalStatusMock,
};

const Template: ComponentStory<typeof ProposalCard> = args => (
  <ProposalCard {...args} />
);

const ManyTemplate: ComponentStory<typeof ProposalCard> = args => (
  <div>
    <Template {...args} />
    <Template {...args} />
    <Template />
  </div>
);

export const Simple = Template.bind({});
Simple.args = proposalCardArgs;

export const Loading = Template.bind({});
Loading.args = {};

export const Group = ManyTemplate.bind({});
Group.args = proposalCardArgs;
