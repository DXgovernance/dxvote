import { useParams } from 'react-router';

interface TypedParams {
  guildId: string;
  proposalId: string;
  proposalType: string;
  chainName: string;
}

export const useTypedParams = (): TypedParams => {
  const { guildId, proposalId, proposalType, chainName } = useParams<{
    guildId?: string;
    proposalId?: string;
    proposalType?: string;
    chainName?: string;
  }>();
  return {
    guildId,
    proposalId,
    proposalType,
    chainName,
  };
};
