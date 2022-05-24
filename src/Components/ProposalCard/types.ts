import { ProposalStatusProps } from 'Components/ProposalStatus/types';
import { Proposal } from '../Types';
import { DecodedAction } from 'old-components/Guilds/ActionsBuilder/types';

export interface ProposalCardProps {
  proposal?: Proposal;
  votes?: number[];
  href?: string;
  statusProps?: ProposalStatusProps;
  summaryActions?: DecodedAction[];
}
