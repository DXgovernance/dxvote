import { ComponentStory, ComponentMeta } from '@storybook/react';
import GuildCard from 'Components/GuildCard/GuildCard';
import { validAddress, nullAddress } from './fixture';
import { useTranslation } from 'react-i18next';
import 'i18n';

export default {
  title: 'GuildCard',
  component: GuildCard,
  argTypes: {
    isLoading: {
      description: 'If true the component will load a skeleton',
    },
    guildAddress: {
      description: 'Address of the guild',
    },
    numberOfMembers: {
      description: 'Number of members in the guild',
    },
    t: {
      description: 'Translation library object',
    },
    numberOfActiveProposals: {
      description: 'Number of active proposals of the guild',
    },
    ensName: {
      description:
        'ENS of the guild, used when there is no name property in the guild configuration',
    },
    data: {
      description:
        'Name of the guild, used when there is no ENS available for the guild',
    },
  },
} as ComponentMeta<typeof GuildCard>;

const TranslationWrapper = ({ args }) => {
  const { t } = useTranslation();
  args.t = t;

  return <GuildCard {...args} />;
};

const Template: ComponentStory<typeof GuildCard> = args => (
  <TranslationWrapper args={validAddress} />
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
