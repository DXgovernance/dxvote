import { Error } from './Error';
import { BlockchainLink, Row } from 'components/common';
import { ProposalCalls } from '../../../types/types';

type BaseCallsProps = Pick<ProposalCalls, 'to' | 'from' | 'value' | 'data'> & {
  showMore: boolean;
  error: any;
};

export const BaseCalls = ({
  to,
  from,
  data,
  value,
  error,
  showMore,
}: BaseCallsProps) => {
  return (
    <div>
      {error && <Error error={error} />}
      <Row style={{ justifyContent: 'flex-start' }}>
        <strong>From: </strong>
        <small>
          <BlockchainLink text={from} toCopy={false} />
        </small>
      </Row>
      <Row style={{ justifyContent: 'flex-start' }}>
        <strong>To: </strong>
        <small>
          <BlockchainLink text={to} toCopy={false} />
        </small>
      </Row>
      <Row style={{ justifyContent: 'flex-start' }}>
        <strong>Value: </strong>
        <small>{value.toString()}</small>
      </Row>
      {showMore ? (
        <Row style={{ justifyContent: 'flex-start' }}>
          <strong>data: </strong>
          <small>{data}</small>
        </Row>
      ) : null}
    </div>
  );
};
