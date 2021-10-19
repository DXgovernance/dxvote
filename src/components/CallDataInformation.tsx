import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useABIService } from 'hooks/useABIService';
import { observer } from 'mobx-react';
import { useEtherscanService } from 'hooks/useEtherscanService';
import { BigNumber, normalizeBalance } from 'utils';
import { ProposalCalls } from 'types';
import PendingCircle from './common/PendingCircle';
import { BlockchainLink } from './common';

interface CallDataInformationParams {
  advancedCalls: boolean;
  scheme: Scheme;
  proposal: Proposal;
  networkContracts: NetworkContracts;
}

const CallParams = styled.div`
color: black;
font-style: ${props => props.fontStyle || 'normal' };
font-size: ${props => props.fontSize || '14px'};
font-weight: ${props => props.fontWeight || 500};
`
const Divider = styled.div`
  border-top: 1px solid gray;
  margin: 10px 0;
`;


const CallDataInformation = observer(
  ({
    advancedCalls,
    scheme,
    proposal,
    networkContracts,
  }: CallDataInformationParams) => {
    const { decodedCallData, ABI } = useABIService();
    const { getContractABI, loading, error } = useEtherscanService();
    const [ProposalCallTexts, setProposalCallTexts] = useState<ProposalCalls[]>(
      new Array(proposal.to.length)
    );

    const proposalCallArray = [];
    const getProposalCalls = async () => {
      const result = await Promise.all(
        proposal.to.map(item => getContractABI(item))
      );
      result.map((abi, i) =>
        proposalCallArray.push(
          decodedCallData(
            scheme.type === 'WalletScheme' &&
              scheme.controllerAddress !== networkContracts.controller
              ? scheme.address
              : networkContracts.avatar,
            proposal.to[i],
            proposal.callData[i],
            proposal.values[i],
            abi
          )
        )
      );
    };
    useEffect(() => {
      getProposalCalls();
      setProposalCallTexts(proposalCallArray);
    }, []);

    const recommendedCallDisplay = ({
      to,
      from,
      recommendedCallUsed,
      callParameters,
      encodedFunctionName,
      data,
    }: ProposalCalls) => {
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
      if (advancedCalls) {
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
    // @todo create decoded text for each function
    const etherscanCallDisplay = (to: string, from: string) => {
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
            <small>{ABI.function.signature}</small>
          </p>
          {advancedCalls ? Object.keys(ABI.args)
            .filter(item => item != '__length__')
            .map((item, i) => {
              const check = ABI.function.inputs[item];
              const functionName = check
                ? ABI.function.inputs[item].name.replace(/[^a-zA-Z0-9]/g, '')
                : 'failed';
              const functionType = check
                ? ABI.function.inputs[item].type
                : 'failed';
              return (
                <p>
                {i > 0 ? <Divider></Divider> : null}
                  <CallParams fontSize='14px' fontWeight={700} >{functionName}: </CallParams>
                  <CallParams fontStyle='italic'>({functionType}) </CallParams>
                  <CallParams>{ABI.args[item]} </CallParams>
                </p>
              );
            }): null}
        </div>
      );
    };

    const baseDisplay = (
      to: string,
      from: string,
      data: string,
      value: BigNumber,
      advancedCalls: boolean
    ) => {
      return (
        <div>
          {error && (
            <p>
              {error.message ==
              `OK-Missing/Invalid API Key, rate limit of 1/5sec applied`
                ? `Missing API key, Please provide the appropriate blockexplorer API Key`
                : error.message}
            </p>
          )}
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
          {advancedCalls ? (
            <p>
              <strong>data: </strong>
              <small>{data}</small>
            </p>
          ) : null}
        </div>
      );
    };

    if (loading) {
      return <PendingCircle height="44px" width="44px" color="blue" />;
    }

    return (
      <div>
        {ProposalCallTexts.map(
          (
            {
              to,
              from,
              recommendedCallUsed,
              callParameters,
              data,
              value,
              encodedFunctionName,
            },
            i
          ) => {
            return (
              <div>
                {i > 0 ? <Divider></Divider> : null}
                <strong> Call #{i + 1}</strong>
                {recommendedCallUsed
                  ? recommendedCallDisplay({
                      to,
                      from,
                      recommendedCallUsed,
                      callParameters,
                      data,
                      encodedFunctionName,
                      value,
                    })
                  : ABI
                  ? etherscanCallDisplay(to, from)
                  : baseDisplay(to, from, data, value, advancedCalls)}
              </div>
            );
          }
        )}
      </div>
    );
  }
);

export default CallDataInformation;
