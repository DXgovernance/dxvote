import reactStringReplace from 'react-string-replace';
import { useLocation } from 'react-router-dom';
import { bnum, normalizeBalance } from 'utils';
import { BlockchainLink } from 'components/common';
import { CallParameterDefinition, ProposalCalls } from '../../../types/types';
import RepDisplay from '../../RepDisplay';
import { useContext } from '../../../contexts';

type RecomendedCallsProps = Pick<
  ProposalCalls,
  | 'to'
  | 'from'
  | 'recommendedCallUsed'
  | 'callParameters'
  | 'encodedFunctionName'
  | 'data'
> & {
  showMore: boolean;
};

export const RecommendedCalls = ({
  to,
  from,
  recommendedCallUsed,
  callParameters,
  encodedFunctionName,
  data,
  showMore,
}: RecomendedCallsProps) => {
  const {
    context: { daoStore },
  } = useContext();

  const proposalId = useLocation().pathname.split('/')[3];
  const proposal = daoStore.getProposal(proposalId);

  const normalizeValue = (value: any, param: CallParameterDefinition) => {
    if (param.decimals) {
      return normalizeBalance(value, param.decimals).toString();
    }

    return value;
  };

  const getComponentToRender = (param: CallParameterDefinition, value: any) => {
    if (param.isRep) {
      return (
        <RepDisplay
          rep={bnum(value)}
          atBlock={proposal.creationEvent.blockNumber}
          timestamp={proposal.creationEvent.timestamp}
        />
      );
    } else {
      return normalizeValue(value, param);
    }
  };

  let decodedCallDetail: React.ReactNodeArray = [
    recommendedCallUsed.decodeText,
  ];
  if (
    recommendedCallUsed.decodeText &&
    recommendedCallUsed.decodeText.length > 0
  ) {
    recommendedCallUsed.params.forEach((param, paramIndex) => {
      const component = getComponentToRender(param, callParameters[paramIndex]);

      decodedCallDetail = reactStringReplace(
        decodedCallDetail,
        `[PARAM_${paramIndex}]`,
        () => component
      );
    });
  }

  if (showMore) {
    return (
      <div>
        <p>
          <strong>From: </strong>{' '}
          <small>
            <BlockchainLink text={from} toCopy={false} />
          </small>
        </p>
        <p>
          <strong>To: </strong>{' '}
          <small>
            <BlockchainLink text={to} toCopy={false} />
          </small>
        </p>
        <p>
          <strong>Descriptions: </strong>{' '}
          <small>{recommendedCallUsed.toName}</small>
        </p>
        <p>
          <strong>Function: </strong>
          <small>{recommendedCallUsed.functionName}</small>
        </p>
        <p>
          <strong>Function Signature: </strong>{' '}
          <small>{encodedFunctionName}</small>
        </p>
        <strong>Params: </strong>
        {Object.keys(callParameters).map((paramIndex, i) => {
          return (
            <p key={i}>
              <small>{callParameters[paramIndex]} </small>
            </p>
          );
        })}
        <strong>data: </strong>
        <small>{data} </small>
      </div>
    );
  }

  return (
    <div>
      <small>{decodedCallDetail}</small>
    </div>
  );
};
