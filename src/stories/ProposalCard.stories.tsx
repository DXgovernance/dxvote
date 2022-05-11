import { ComponentStory, ComponentMeta } from '@storybook/react';
import ProposalCard from 'Components/ProposalCard/ProposalCard';
import { ProposalCardProps } from 'Components/ProposalCard/types';
import { ProposalState } from 'Components/Types';
import { BigNumber } from 'ethers';
import moment from 'moment';

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
  proposal: {
    id: '0x1234567890123456789012345678901234567890',
    title: 'SWPR single reward campaign',
    contentHash: '0x1234567890123456789012345678901234567890',
    creator: '0x1234567890123456789012345678901234567890',
    data: [],
    to: [],
    value: [],
    startTime: moment(),
    endTime: moment(),
    state: ProposalState.Active,
    totalActions: BigNumber.from(0),
    totalVotes: [],
  },
  ensAvatar: {
    ensName: 'venky0x.eth',
  },
  href: '/',
  votes: [11, 1],
  statusProps: {
    endTime: moment(),
    status: ProposalState.Active,
    timeDetail: '1 minute ago',
  },
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
