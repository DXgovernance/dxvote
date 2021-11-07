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
  proposals: ProposalsExtended[];
}

type Action = UpdateAction | DefaultAction;

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

  const initialProposalState: ProposalsState = {
    loading: false,
    error: null,
    proposals: allProposals,
  };

  const [state, dispatch] = useReducer(
    (state: ProposalsState = initialProposalState, action: Action) => {
      switch (action.type) {
        case 'update':
          return action.payload;
        case 'default':
          return initialProposalState;
        default:
          return state;
      }
    },
    initialProposalState
  );

  return (
    <ProposalsContext.Provider value={[state, dispatch]}>
      {children}
    </ProposalsContext.Provider>
  );
};
