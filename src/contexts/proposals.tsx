import { useContext } from 'contexts';
import { createContext, ReactNode } from 'react';
import { filterInitialCriteria } from 'utils';

export type ProposalsExtended = Proposal &
  ProposalStateChange &
  VotingMachineParameters &
  Pick<Scheme, 'maxSecondsForExecution' | 'type'> & {
    autoBoost: Boolean;
  };

interface ProposalProviderProps {
  children: ReactNode;
}

interface ProposalsState {
  loading: boolean;
  error: Error | null;
  proposals: ProposalsExtended[];
}

export const ProposalsContext = createContext(undefined);

export const ProposalProvider = ({ children }: ProposalProviderProps) => {
  const {
    context: { daoStore },
  } = useContext();

  const allProposals: ProposalsExtended[] = filterInitialCriteria(
    daoStore.getAllProposals().map(cacheProposal => {
      return Object.assign(
        cacheProposal,
        daoStore.getProposalStatus(cacheProposal.id)
      );
    }),
    daoStore
  );

  const proposalState: ProposalsState = {
    loading: false,
    error: null,
    proposals: allProposals,
  };

  return (
    <ProposalsContext.Provider value={proposalState}>
      {children}
    </ProposalsContext.Provider>
  );
};
