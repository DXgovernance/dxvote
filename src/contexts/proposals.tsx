import { useContext } from 'contexts';
import { SearchResult } from 'minisearch';
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

interface FilterAction {
  type: 'filter';
  payload: {
    search: string;
    scheme: string;
    title: SearchResult[];
  };
}

interface ProposalsState {
  loading: boolean;
  error: Error | null;
  proposals: ProposalsExtended[];
}

type Action = FilterAction;

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
        case 'filter':
          const { scheme, title, search } = action.payload;
          console.log(scheme, search, title);
          return {
            ...state,
            proposals: initialProposalState.proposals.filter(
              proposal =>
                proposal.scheme === scheme &&
                parseInt(proposal.stateInVotingMachine as any) ===
                  parseInt(search) &&
                title.find(elem => elem.id === proposal.id)
            ),
          };

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
