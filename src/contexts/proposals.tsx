import { useContext } from 'contexts';
import { createContext, ReactNode } from 'react';
import { BigNumber, filterInitialCriteria } from 'utils';

export type ProposalsExtended = Proposal &
  ProposalStateChange &
  VotingMachineParameters &
  Pick<Scheme, 'maxSecondsForExecution' | 'type'> & {
    autoBoost: Boolean;
    boostTime: BigNumber;
    finishTime: BigNumber;
    status: string,
    pendingAction: number,
  };

interface ProposalProviderProps {
  children: ReactNode;
}

export interface ProposalsContextInterface {
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

  const proposalState: ProposalsContextInterface = {
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
