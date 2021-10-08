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
          if (ABI) {
            console.log(ABI);
            return (
              <div>
                <strong>From:</strong>
                <small>{from}</small>
                <strong>To: </strong>
                <small>{to}</small>
                <strong>Function Name: </strong>
                <small>{ABI.function.name}</small>
                <strong>Params:</strong>
                {Object.values(ABI.args).map((item, i) => {
                  console.log(item);
                  const functionName = ABI.function.inputs[i].name.replace(
                    /[^a-zA-Z0-9]/g,
                    ''
                  );
                  const functionType = ABI.function.inputs[i].type;
                  console.log(functionName, functionType);
                  return (
                    <p>
                      <small>Function Name: </small>{' '}
                      <small>{functionName}</small>
                      <small>Function Value: </small> <small>{item}</small>
                      <small>Function type: </small>{' '}
                      <small>{functionType}</small>
                    </p>
                  );
                })}
              </div>
            );
          }
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
