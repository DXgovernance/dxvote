import { useState, useEffect } from 'react';
import { useABIService } from 'hooks/useABIService';
import { observer } from 'mobx-react';
import { useEtherscanService } from 'hooks/useEtherscanService';
import { BigNumber, normalizeBalance } from 'utils';
import { ProposalCalls } from 'types';
import PendingCircle from './common/PendingCircle';

interface CallDataInformationParams {
  advancedCalls: boolean;
  scheme: Scheme;
  proposal: Proposal;
  networkContracts: NetworkContracts;
}

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

    useEffect(() => {
      const proposalCallArray = [];
      proposal.to.forEach(async (to, index) => {
        const contractABI = await getContractABI(to);
        proposalCallArray[index] = decodedCallData(
          scheme.type === 'WalletScheme' &&
            scheme.controllerAddress !== networkContracts.controller
            ? scheme.address
            : networkContracts.avatar,
          proposal.to[index],
          proposal.callData[index],
          proposal.values[index],
          contractABI
        );
        setProposalCallTexts(proposalCallArray);
      });
    }, []);

    if (loading) {
      return <PendingCircle height="44px" width="44px" />;
    }

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
              <strong>From: </strong> <small>{from}</small>
            </p>
            <p>
              <strong>To: </strong> <small>{to}</small>
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
    const etherscanCallDisplay = (to: string, from: string) => {
      return (
        <div>
          <p>
            <strong>From:</strong>
            <small>{from}</small>
          </p>
          <p>
            <strong>To: </strong>
            <small>{to}</small>
          </p>
          <p>
            <strong>Function Name: </strong>
            <small>{ABI.function.signature}</small>
          </p>
          <strong>Params:</strong>
          {Object.keys(ABI.args)
            .filter(item => item != '__length__')
            .map(item => {
              const check = ABI.function.inputs[item];
              const functionName = check
                ? ABI.function.inputs[item].name.replace(/[^a-zA-Z0-9]/g, '')
                : 'failed';
              const functionType = check
                ? ABI.function.inputs[item].type
                : 'failed';
              return (
                <p>
                  <small>{functionName} </small>
                  <small>{functionType} </small>
                  <small>{ABI.args[item]} </small>
                </p>
              );
            })}
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
                ? `Missing API key, Please provide the appropriate blockexplorer Api Key`
                : error.message}
            </p>
          )}
          <p>
            <strong>From: </strong>
            <small>{from}</small>
          </p>
          <p>
            <strong>To: </strong>
            <small>{to}</small>
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
                <div> Call #{i + 1}</div>
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
                <hr></hr>
              </div>
            );
          }
        )}
      </div>
    );
  }
);

export default CallDataInformation;
