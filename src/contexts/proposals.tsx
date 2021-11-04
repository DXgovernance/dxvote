import { useContext } from 'contexts';
import {  createContext, ReactNode , useReducer} from 'react';
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

type Action  =  {type: 'update', payload: ProposalsExtended[]} | { type: 'display'} 

export const ProposalsContext = createContext(undefined);


export const ProposalProvider = ({ children }: ProposalProviderProps) => {
const {
  context: { daoStore },
} = useContext();

const initialProposalState: ProposalsExtended[] = filterInitialCriteria(
  daoStore.getAllProposals().map(cacheProposal => {
    return Object.assign(
      cacheProposal,
      daoStore.getProposalStatus(cacheProposal.id)
    );
  }),
  daoStore
);
  const [state, dispatch] = useReducer((state:ProposalsExtended[], action:Action) => {
  switch (action.type) {
    case "update":
      return action.payload 
    case "display":
      return state
    default:
      return initialProposalState
  }
  }, initialProposalState)

  return (
    <ProposalsContext.Provider value={[state, dispatch]}>
      {children}
    </ProposalsContext.Provider>
  );
};
