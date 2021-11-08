import styled from 'styled-components';

import { ProposalCalls } from 'types';
import { BlockchainLink } from '../../common';

const CallParams = styled.span`
  color: black;
  font-style: ${props => props.fontStyle || 'normal'};
  font-size: ${props => props.fontSize || '14px'};
  font-weight: ${props => props.fontWeight || 500};
`;

type EtherscanCallProps = Pick<ProposalCalls, 'to' | 'from'> & {
  abi: any;
  showMore: boolean;
};

export const EtherscanCalls = ({
  to,
  from,
  abi,
  showMore,
}: EtherscanCallProps) => {
  if (showMore) {
    return (
      <div>
        <p>
          <strong>From:</strong>
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
          <strong>Function: </strong>
          <small>{abi?.function?.signature}</small>
        </p>
        {Object.keys(abi.args)
          .filter(item => item != '__length__')
          .map(item => {
            const check = abi.function.inputs[item];
            const functionName = check
              ? abi.function.inputs[item].name.replace(/[^a-zA-Z0-9]/g, '')
              : 'failed';
            const functionType = check
              ? abi.function.inputs[item].type
              : 'failed';
            return (
              <p>
                <CallParams fontSize="14px" fontWeight={700}>
                  {functionName}:{' '}
                </CallParams>
                <CallParams fontStyle="italic">({functionType}) </CallParams>
                <CallParams>{abi.args[item]} </CallParams>
              </p>
            );
          })}
      </div>
    );
  } else {
    return (
      <div>
        <CallParams>from </CallParams>
        <CallParams fontStyle="italic">{from} </CallParams>
        <CallParams>to </CallParams>
        <CallParams fontStyle="italic">{to} </CallParams>
        <CallParams>calling function </CallParams>
        <CallParams fontStyle="italic">{abi?.function?.signature} </CallParams>
      </div>
    );
  }
};
