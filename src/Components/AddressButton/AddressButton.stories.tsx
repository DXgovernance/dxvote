import { ComponentStory, ComponentMeta } from '@storybook/react';
import AddressButton from 'Components/AddressButton/AddressButton';
import { fullProps, partialProps } from './fixtures';

export default {
  title: 'Addresses/AddressButton',
  component: AddressButton,
  argTypes: {
    address: {
      description: 'Ethereum address',
    },
    transactionsCounter: {
      description: 'Number of transactions for the address',
    },
  },
} as ComponentMeta<typeof AddressButton>;

const Template: ComponentStory<typeof AddressButton> = args => (
  <AddressButton {...args} />
);

export const WithTransactions = Template.bind({});
WithTransactions.args = fullProps;

export const WithoutTransactions = Template.bind({});
WithoutTransactions.args = partialProps;

export const Loading = Template.bind({});
Loading.args = {};
