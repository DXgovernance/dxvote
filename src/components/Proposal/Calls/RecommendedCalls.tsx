import { normalizeBalance } from 'utils';
import { BlockchainLink } from 'components/common';
import { ProposalCalls } from 'types';

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
  let decodedCallText = '';

  if (
    recommendedCallUsed.decodeText &&
    recommendedCallUsed.decodeText.length > 0
  ) {
    decodedCallText = recommendedCallUsed.decodeText;

    recommendedCallUsed.params.map((_, paramIndex) => {
      if (recommendedCallUsed.params[paramIndex].decimals) {
        decodedCallText = decodedCallText.replaceAll(
          '[PARAM_' + paramIndex + ']',
          String(
            normalizeBalance(
              callParameters[paramIndex],
              recommendedCallUsed.params[paramIndex].decimals
            )
          )
        );
      }
      decodedCallText = decodedCallText.replaceAll(
        '[PARAM_' + paramIndex + ']',
        callParameters[paramIndex]
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
        {Object.keys(callParameters).map(paramIndex => {
          return (
            <p>
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
      <small>{decodedCallText}</small>
    </div>
  );
};
