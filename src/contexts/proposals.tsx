import { useContext } from 'contexts';
import { SearchResult } from 'minisearch';
import { createContext, ReactNode, useReducer, useMemo } from 'react';
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
  title: SearchResult[] | undefined;
}

interface ProposalsState {
  loading: boolean;
  error: Error | null;
  proposals: ProposalsExtended[];
  filters: Filters;
}

type Action = FilterAction;

export const ProposalsContext = createContext(undefined);

//helpers
const comp = (f, g) => x => f(g(x));

const compose = (...fs) => fs.reduce(comp, x => x);

const append = (xs, x) => xs.concat([x]);

const transduce =
  (...ts) =>
  xs =>
    xs.reduce(ts.reduce(comp)(append), []);

const filterer = f => k => (acc, x) => f(x) ? k(acc, x) : acc;

// function selectors
const statusSelector = (proposal, status) =>
  status === 'Any Status' || !status
    ? proposal
    : parseInt(proposal.stateInVotingMachine) === parseInt(status);

const schemeSelector = (proposal, scheme) =>
  scheme === 'All Schemes' || !scheme ? proposal : proposal.scheme === scheme;

const titleSelector = (proposal, title) =>
  !title || title.length === 0
    ? proposal
    : title.find(elem => elem.id === proposal.id);

const filterSelector = (status, scheme, title, items) =>
  transduce(
    filterer(proposal => schemeSelector(proposal, scheme)),
    filterer(proposal => statusSelector(proposal, status)),
    filterer(proposal => titleSelector(proposal, title))
  )(items);

export const ProposalProvider = ({ children }: ProposalProviderProps) => {
  const {
    context: { daoStore },
  } = useContext();

  const allProposals: ProposalsExtended[] = useMemo(
    () =>
      filterInitialCriteria(
        daoStore.getAllProposals().map(cacheProposal => {
          return Object.assign(
            cacheProposal,
            daoStore.getProposalStatus(cacheProposal.id)
          );
        }),
        daoStore
      ),
    []
  );

  const initialProposalState: ProposalsState = {
    loading: false,
    error: null,
    proposals: allProposals,
    filters: {
      scheme: undefined,
      title: undefined,
      status: undefined,
    },
  };

  const [state, dispatch] = useReducer(
    (state: ProposalsState = initialProposalState, action: Action) => {
      switch (action.type) {
        case 'filter':
          const { scheme, title, status } = action.payload;
          console.log(scheme, title, status);
          return {
            ...state,
            proposals: filterSelector(
              status,
              scheme,
              title,
              initialProposalState.proposals
            ),
            filters: {
              title: title,
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
