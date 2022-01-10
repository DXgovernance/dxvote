import React from 'react';
import { ERC20Guild } from '../../types/ERC20Guild';
import { Proposal } from '../../types/types.guilds';

export const ProposalsContext = React.createContext(null);

interface ProposalsProviderProps {
  children: React.ReactNode;
}
interface ProposalsProviderState {
  proposals: {
    [proposalID: string]: Proposal;
  };
}

export class ProposalsProvider extends React.Component<
  ProposalsProviderProps,
  ProposalsProviderState
> {
  public state = {
    proposals: {},
  };

  exists = (id: string) => !!this.state.proposals[id];

  saveProposal = ({ proposal }) => {
    this.setState(prevState => ({
      proposals: { ...prevState.proposals, [proposal.id]: proposal },
    }));
  };

  getProposals = async (
    contract: ERC20Guild,
    ids: string[]
  ): Promise<Proposal[]> => {
    const result = [];
    const newProposalsData = [];
    for (let proposalId of ids) {
      if (this.exists(proposalId)) {
        result.push(this.state.proposals[proposalId]);
      } else {
        const proposalPromise: Promise<Proposal> = contract
          .getProposal(proposalId)
          .then(data => {
            const proposal: Proposal = { ...data, id: proposalId };
            return proposal;
          });
        result.push(proposalPromise);
        newProposalsData.push({ idx: result.length - 1 });
      }
    }
    const resolvedProposals = await Promise.all(result);

    newProposalsData.forEach(({ idx }) =>
      this.saveProposal({ proposal: resolvedProposals[idx] })
    );

    return resolvedProposals;
  };

  render() {
    return (
      <ProposalsContext.Provider
        value={{
          proposals: this.state.proposals,
          getProposals: this.getProposals,
        }}
      >
        {this.props.children}
      </ProposalsContext.Provider>
    );
  }
}

export const useProposalsContext = (): ProposalsProvider =>
  React.useContext(ProposalsContext);
