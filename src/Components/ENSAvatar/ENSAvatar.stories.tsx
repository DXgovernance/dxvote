import { ComponentStory, ComponentMeta } from '@storybook/react';
import ENSAvatar from './ENSAvatar';
import { withAvatarNFT, withoutAvatarNFT, customSize } from './fixtures';

export default {
  title: 'Addresses/ENSAvatar',
  component: ENSAvatar,
  argTypes: {
    address: {
      description: 'Ethereum address',
    },
    size: {
      description: 'Size of the displayed avatar',
      defaultValue: 24,
    },
  },
} as ComponentMeta<typeof ENSAvatar>;

const Template: ComponentStory<typeof ENSAvatar> = args => (
  <ENSAvatar {...args} />
);

export const WithAvatarNFT = Template.bind({});
WithAvatarNFT.args = withAvatarNFT;

export const WithoutAvatarNFT = Template.bind({});
WithoutAvatarNFT.args = withoutAvatarNFT;

export const CustomSize = Template.bind({});
CustomSize.args = customSize;

export const Loading = Template.bind({});
Loading.args = {};
