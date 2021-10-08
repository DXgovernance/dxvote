import { useContext } from 'contexts';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ProposalCalls, useABIService } from 'hooks/useABIService';
import { observer } from 'mobx-react';
import { useEtherscanService } from 'hooks/useEtherscanService';

const CallDataInformation = observer(({ advancedCalls }) => {
  const {
    context: { daoStore, configStore },
  } = useContext();

  const proposalId = useLocation().pathname.split('/')[3];
  const networkContracts = configStore.getNetworkContracts();
  const proposal = daoStore.getProposal(proposalId);
  const scheme = daoStore.getScheme(proposal.scheme);
  const { decodedCallData, ABI } = useABIService();
  const { getContractABI, loading, error } = useEtherscanService();
  const [ProposalCallTexts, setProposalCallTexts] = useState<ProposalCalls[]>(
    new Array(proposal.to.length)
  );

  const proposalCallArray = [];
  const getProposalCalls = async () => {
    for (var p = 0; p < proposal.to.length; p++) {
      const contractABI = await getContractABI(proposal.to[p]);
      proposalCallArray[p] = decodedCallData(
        scheme.type === 'WalletScheme' &&
          scheme.controllerAddress !== networkContracts.controller
          ? scheme.address
          : networkContracts.avatar,
        proposal.to[p],
        proposal.callData[p],
        proposal.values[p],
        contractABI
      );
      setProposalCallTexts(proposalCallArray);
    }
  };
  useEffect(() => {
    getProposalCalls();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>refresh page for call data...</div>;
  }

  return (
    <div>
      {ProposalCallTexts.map(
        ({
          to,
          from,
          recommendedCallUsed,
          callParamaters,
          data,
          decodedCallText,
          value,
          encodedFunctionName,
        }) => {
          if (recommendedCallUsed) {
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
                    <small>Function: </small>{' '}
                    <small>{encodedFunctionName}</small>
                  </p>
                  <strong>
                    Params:{' '}
                    {Object.keys(callParamaters).map(
                      paramIndex => callParamaters[paramIndex]
                    )}
                  </strong>
                  <strong>data: {data}</strong>
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
            console.log(ABI)
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
                  .map((item) => {
                    const check = ABI.function.inputs[item];
                    const functionName = check
                      ? ABI.function.inputs[item].name.replace(/[^a-zA-Z0-9]/g, '')
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
