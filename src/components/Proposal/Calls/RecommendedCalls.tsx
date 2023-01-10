import reactStringReplace from 'react-string-replace';
import { useLocation } from 'react-router-dom';
import { bnum, normalizeBalance } from 'utils';
import { BlockchainLink, Row } from 'components/common';
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
    context: { daoStore, configStore },
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
      let component = getComponentToRender(param, callParameters[paramIndex]);

      if (
        recommendedCallUsed.functionName ==
          'externalTokenTransfer(address,address,uint256,address)' &&
        paramIndex == 2 &&
        configStore.getTokenData(callParameters[0])
      ) {
        component = getComponentToRender(
          {
            type: 'uint256',
            name: configStore.getTokenData(callParameters[0]).name,
            defaultValue: '',
            decimals: configStore.getTokenData(callParameters[0]).decimals,
            isRep: false,
          },
          callParameters[2]
        );
      }

      decodedCallDetail = reactStringReplace(
        reactStringReplace(
          decodedCallDetail,
          `[PARAM_${paramIndex}]`,
          () => component
        ),
        'FROM',
        () => proposal.scheme
      );
    });
  }

  if (showMore) {
    return (
      <div>
        <Row style={{ justifyContent: 'flex-start' }}>
          <strong>From: </strong>{' '}
          <small>
            <BlockchainLink text={from} toCopy={false} />
          </small>
        </Row>
        <Row style={{ justifyContent: 'flex-start' }}>
          <strong>To: </strong>{' '}
          <small>
            <BlockchainLink text={to} toCopy={false} />
          </small>
        </Row>
        <Row style={{ justifyContent: 'flex-start' }}>
          <strong>Descriptions: </strong>{' '}
          <small>{recommendedCallUsed.toName}</small>
        </Row>
        <Row style={{ justifyContent: 'flex-start' }}>
          <strong>Function: </strong>
          <small>{recommendedCallUsed.functionName}</small>
        </Row>
        <Row style={{ justifyContent: 'flex-start' }}>
          <strong>Function Signature: </strong>{' '}
          <small>{encodedFunctionName}</small>
        </Row>
        <strong>Params: </strong>
        {Object.keys(callParameters).map((paramIndex, i) => {
          return (
            <Row key={i} style={{ justifyContent: 'flex-start' }}>
              <small>{callParameters[paramIndex]} </small>
            </Row>
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
