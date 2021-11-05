import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useABIService } from 'hooks/useABIService';
import { observer } from 'mobx-react';
import { useEtherscanService } from 'hooks/useEtherscanService';
import { BigNumber, normalizeBalance } from 'utils';
import { ProposalCalls } from 'types';
import PendingCircle from '../../common/PendingCircle';
import { BlockchainLink } from '../../common';
import { Link } from 'react-router-dom';

interface CallDataInformationParams {
  advancedCalls: boolean;
  scheme: Scheme;
  proposal: Proposal;
  networkContracts: NetworkContracts;
}

const CallParams = styled.span`
  color: black;
  font-style: ${props => props.fontStyle || 'normal'};
  font-size: ${props => props.fontSize || '14px'};
  font-weight: ${props => props.fontWeight || 500};
`;

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
    const { decodedCallData } = useABIService();
    const { getContractABI, error } = useEtherscanService();
    const [loading, setLoading] = useState(false);
    const [ProposalCallTexts, setProposalCallTexts] = useState<ProposalCalls[]>(
      new Array(proposal.to.length)
    );

    const proposalCallArray = [];
    const getProposalCalls = async () => {
      setLoading(true);
      const result = await Promise.all(
        proposal.to.map(item => getContractABI(item))
      );
      result.map((abi, i) => {
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
        );
      });
      setLoading(false);
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

    // function that creates a short description of "from X to X calling function X"
    const decodedText = (from: string, to: string, functionName: string) => {
      return (
        <div>
          <CallParams>from </CallParams>
          <CallParams fontStyle="italic">{from} </CallParams>
          <CallParams>to </CallParams>
          <CallParams fontStyle="italic">{to} </CallParams>
          <CallParams>calling function </CallParams>
          <CallParams fontStyle="italic">{functionName} </CallParams>
        </div>
      );
    };
    const etherscanCallDisplay = (to: string, from: string, abi: any) => {
      if (advancedCalls) {
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
              .map((item, i) => {
                const check = abi.function.inputs[item];
                const functionName = check
                  ? abi.function.inputs[item].name.replace(/[^a-zA-Z0-9]/g, '')
                  : 'failed';
                const functionType = check
                  ? abi.function.inputs[item].type
                  : 'failed';
                return (
                  <p>
                    {i > 0 ? <Divider></Divider> : null}
                    <CallParams fontSize="14px" fontWeight={700}>
                      {functionName}:{' '}
                    </CallParams>
                    <CallParams fontStyle="italic">
                      ({functionType}){' '}
                    </CallParams>
                    <CallParams>{abi.args[item]} </CallParams>
                  </p>
                );
              })}
          </div>
        );
      }
      return decodedText(from, to, abi?.function?.signature);
    };

    const errorDisplay = (error: Error) => {
      if (error.message == 'API')
        return (
          <div>
            An API Key error has occured:
            <Link to="/config"> Click here to enter API key</Link>
          </div>
        );
      return <p>{error.message}</p>;
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
          {error && errorDisplay(error)}
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
              contractABI,
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
                      contractABI,
                    })
                  : contractABI.function
                  ? etherscanCallDisplay(to, from, contractABI)
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
