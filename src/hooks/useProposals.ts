import { ProposalsContext } from 'contexts/proposals';
import { useContext } from 'react';

export const useProposals = () => {
  const context = useContext(ProposalsContext);
  if (context === undefined) {
    throw new Error('useProposals must be within ProposalsProvider');
  }

  return context;
};
