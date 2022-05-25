import { GuildCardProps } from './types';

export const validAddress: GuildCardProps = {
  guildAddress: '0xa47BbE8Dd6dB29D45FE5eeD838c4f136884AEAF3',
  numberOfMembers: 5,
  t: null,
  numberOfActiveProposals: 10,
  ensName: 'REPGuild',
  data: { name: 'REPGuild' },
};

export const nullAddress: GuildCardProps = {
  isLoading: true,
  guildAddress: null,
  numberOfMembers: null,
  t: null,
  numberOfActiveProposals: null,
  ensName: null,
  data: null,
};
