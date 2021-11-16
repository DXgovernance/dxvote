import { useContext } from 'contexts';
import { SearchResult } from 'minisearch';
import { createContext, ReactNode, useReducer  } from 'react';
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
  payload: Filters;
}

interface Filters {
  status: string | undefined;
  scheme: string | undefined;
  search: SearchResult[] | undefined;
}

interface ProposalsState {
  loading: boolean;
  error: Error | null;
  proposals: ProposalsExtended[];
  filters: Filters;
}

type Action = FilterAction;

export const ProposalsContext = createContext(undefined);


const statusFilter = (proposal: ProposalsExtended, status: string) =>
  status === 'Any Status' || !status
    ? proposal
    : parseInt(proposal.stateInVotingMachine as any) === parseInt(status);

const schemeFitler = (proposal: ProposalsExtended, scheme: string) =>
  scheme === 'All Schemes' || !scheme ? proposal : proposal.scheme === scheme;

const searchFilter = (proposal: ProposalsExtended, search: SearchResult[]) =>
  !search || search.length === 0
    ? proposal
    : search.find(elem => elem.id === proposal.id);

export const ProposalProvider = ({ children }: ProposalProviderProps) => {
  const {
    context: { daoStore },
  } = useContext();

  const allProposals: ProposalsExtended[] =
      filterInitialCriteria(
        daoStore.getAllProposals().map(cacheProposal => {
          return Object.assign(
            cacheProposal,
            daoStore.getProposalStatus(cacheProposal.id)
          );
        }),
        daoStore
      )

  const initialProposalState: ProposalsState = {
    loading: false,
    error: null,
    proposals: allProposals,
    filters: {
      scheme: undefined,
      search: undefined,
      status: undefined,
    },
  };

  const [state, dispatch] = useReducer(
    (state: ProposalsState = initialProposalState, action: Action) => {
      switch (action.type) {
        case 'filter':
          const { scheme, search, status } = action.payload;
          console.log(scheme, search, status);
          return {
            ...state,
            proposals: initialProposalState.proposals.filter( proposal => statusFilter(proposal, status) && schemeFitler(proposal, scheme) && searchFilter(proposal, search)),
            filters: {
              search: search,
              status: status,
              scheme: scheme,
            },
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
