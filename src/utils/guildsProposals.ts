import { Proposal } from "../types/types.guilds.d";

export function mapStructToProposal(
  proposalStruct: any,
  proposalId: string
): Proposal {
  const proposal: Proposal = {
    ...proposalStruct,
    id: proposalId,
  };
  return proposal;
}
