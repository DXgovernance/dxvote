import { ProposalsContext } from 'contexts/proposals';
import { useContext } from 'react';

export const useProposals = () => useContext(ProposalsContext);
