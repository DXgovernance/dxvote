import { useContext } from 'contexts';
import { createContext, ReactNode, useReducer } from 'react';
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

interface UpdateAction {
  type: 'update';
  payload: ProposalsState;
}

interface DefaultAction {
  type: 'default';
  payload: ProposalsState;
}

interface ProposalsState {
  loading: boolean;
  error: Error | null;
  state: ProposalsExtended[];
}

type Action = UpdateAction | DefaultAction

export const ProposalsContext = createContext(undefined);

const proposalsReducer = (state: ProposalsState, action: Action) => {
  switch (action.type) {
    case 'update':
      return action.payload;
    case 'default':
      return state;
    default:
      return state;
  }
};

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

  const initialProposalState: ProposalsState = {
    loading: false,
    error: null,
    state: allProposals,
  };

  const [state, dispatch] = useReducer(proposalsReducer, initialProposalState);

  return (
    <ProposalsContext.Provider value={[state, dispatch]}>
      {children}
    </ProposalsContext.Provider>
  );
};
