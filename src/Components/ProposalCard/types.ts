import { ProposalStatusProps } from 'Components/ProposalStatus/types';
import { Proposal, ENSAvatar } from '../Types';

export interface ProposalCardProps {
  proposal?: Proposal;
  votes?: number[];
  ensAvatar?: ENSAvatar;
  href?: string;
  statusProps?: ProposalStatusProps;
}
