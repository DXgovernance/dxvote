import { ComponentStory, ComponentMeta } from '@storybook/react';
import AddressButton from 'Components/AddressButton/AddressButton';
import '@testing-library/jest-dom';
import { fullProps, partialProps } from './fixtures';

export default {
  title: 'Components/AddressButton',
  component: AddressButton,
  argTypes: {
    address: {
      description: 'Proposal creator address',
    },
    transactionsCounter: {
      description: 'Number of transactions of the proposal',
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

