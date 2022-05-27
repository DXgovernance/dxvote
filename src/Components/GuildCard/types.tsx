import { CardProps } from 'old-components/Guilds/common/Card/index';

export interface GuildCardProps extends CardProps {
  isLoading?: boolean;
  guildAddress: string;
  numberOfMembers: any;
  t: any;
  numberOfActiveProposals: any;
  ensName: string;
  data: any;
}

export interface GuildCardContentProps {
  isLoading?: boolean;
  ensName: string;
  data: any;
}

export interface GuildCardHeaderProps {
  isLoading?: boolean;
  t: any;
  numberOfActiveProposals: any;
  numberOfMembers: any;
}
