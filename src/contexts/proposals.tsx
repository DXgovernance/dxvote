import { useContext } from 'contexts';
import { createContext, ReactNode } from 'react';

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
  proposals: ProposalsExtended[];
}

export const ProposalsContext = createContext(undefined);

export const ProposalProvider = ({ children }: ProposalProviderProps) => {
  const {
    context: { daoStore },
  } = useContext();

  const allProposals: ProposalsExtended[] = daoStore.getAllProposals().map(cacheProposal => {
      return Object.assign(
        cacheProposal,
        daoStore.getProposalStatus(cacheProposal.id)
      );
    })

  const proposalState: ProposalsState = {
    proposals: allProposals,
  };

  return (
    <ProposalsContext.Provider value={proposalState}>
      {children}
    </ProposalsContext.Provider>
  );
};
