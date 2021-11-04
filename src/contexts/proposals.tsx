import { useContext } from 'contexts';
import { useState, createContext, ReactNode , useReducer} from 'react';
import { filterInitialCriteria } from 'utils';

//types
export type ProposalsExtended = Proposal &
  ProposalStateChange &
  VotingMachineParameters &
  Pick<Scheme, 'maxSecondsForExecution' | 'type'> & {
    autoBoost: Boolean;
  };

interface ProposalProviderProps {
  children: ReactNode;
}

const {
  context: { daoStore },
} = useContext();

export const ProposalsContext = createContext(undefined);

const initialProposalState: ProposalsExtended[] = filterInitialCriteria(
  daoStore.getAllProposals().map(cacheProposal => {
    return Object.assign(
      cacheProposal,
      daoStore.getProposalStatus(cacheProposal.id)
    );
  }),
  daoStore
);

 const proposalReducer = (state: ProposalsExtended[], action) => {
  switch (action.type) {
    case "update":
      return action.payload 
    case "display":
      return state
    default:
      return initialProposalState
  }
}
export const ProposalProvider = ({ children }: ProposalProviderProps) => {
  const [state, dispatch] = useReducer(proposalReducer, initialProposalState)

  return (
    <ProposalsContext.Provider value={[state, dispatch]}>
      {children}
    </ProposalsContext.Provider>
  );
};
