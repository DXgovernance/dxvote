import { Error } from './Error';
import { BlockchainLink } from 'components/common';

export const BaseCalls = ({ to, from, data, value, error, showMore }) => {
  return (
    <div>
      {error && <Error error={error} />}
      <p>
        <strong>From: </strong>
        <small>
          <BlockchainLink text={from} toCopy={false} />
        </small>
      </p>
      <p>
        <strong>To: </strong>
        <small>
          <BlockchainLink text={to} toCopy={false} />
        </small>
      </p>
      <p>
        <strong>Value: </strong>
        <small>{value.toString()}</small>
      </p>
      {showMore ? (
        <p>
          <strong>data: </strong>
          <small>{data}</small>
        </p>
      ) : null}
    </div>
  );
};
