import { useState, useEffect } from 'react';
import { useABIService } from 'hooks/useABIService';
import { observer } from 'mobx-react';
import { useEtherscanService } from 'hooks/useEtherscanService';
import { normalizeBalance } from 'utils';
import { ProposalCalls } from 'types';
import PendingCircle from './common/PendingCircle';

interface CallDataInformationParams {
  advancedCalls: boolean,
  scheme: Scheme,
  proposal: Proposal,
  networkContracts: NetworkContracts
}

const CallDataInformation = observer(({ advancedCalls, scheme, proposal, networkContracts }: CallDataInformationParams) => {

  const { decodedCallData, ABI } = useABIService();
  const { getContractABI, loading, error } = useEtherscanService();
  const [ProposalCallTexts, setProposalCallTexts] = useState<ProposalCalls[]>(
    new Array(proposal.to.length)
  );

  const proposalCallArray = [];
  const getProposalCalls = () => {
    proposal.to.forEach(async(to, index) => {
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
    })
      setProposalCallTexts(proposalCallArray);
  };
  useEffect(() => {
    getProposalCalls();
  }, []);

  if (loading) {
    return <PendingCircle height='44px' width='44px'/>
  }

  return (
    <div>
      {ProposalCallTexts.map(
        ({
          to,
          from,
          recommendedCallUsed,
          callParameters,
          data,
          value,
          encodedFunctionName,
        }) => {
          if (recommendedCallUsed) {
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
          }
          if (ABI) {
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
                      ? ABI.function.inputs[item].name.replace(
                          /[^a-zA-Z0-9]/g,
                          ''
                        )
                      : 'failed';
                    console.log(functionName);
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
          }
          return (
            <div>
              {error && <p>{error.message}</p>}
              <p>
                <strong>From: </strong>
                <small>{from}</small>
              </p>
              <p>
                <strong>To: </strong>
                <small>{to}</small>
              </p>
              <p>
                <strong>data: </strong>
                <small>{data}</small>
              </p>
              <p>
                <strong>Value: </strong>
                <small>{value.toString()}</small>
              </p>
            </div>
          );
        }
      )}
    </div>
  );
});

export default CallDataInformation;
