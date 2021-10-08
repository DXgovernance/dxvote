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
  const { decodedCallData } = useABIService();
  const { getContractABI, loading, error } = useEtherscanService();
  const [ProposalCallTexts, setProposalCallTexts] = useState<ProposalCalls[]>(
    new Array(proposal.to.length)
  );

  const proposalCallArray = [];
  const getProposalCalls = async () => {
    for (var p = 0; p < proposal.to.length; p++) {
      const ABI = await getContractABI(proposal.to[p]);
      proposalCallArray[p] = decodedCallData(
        scheme.type === 'WalletScheme' &&
          scheme.controllerAddress !== networkContracts.controller
          ? scheme.address
          : networkContracts.avatar,
        proposal.to[p],
        proposal.callData[p],
        proposal.values[p],
        ABI
      );
      setProposalCallTexts(proposalCallArray);
    }
  };
  useEffect(() => {
    getProposalCalls();
    console.log(proposalCallTexts);
  }, [proposal]);

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
          functions,
          args,
          recommendedCallUsed,
          callParamaters,
          data,
          decodedCallText,
          value,
          encodedFunctionName,
        }) => {
        console.log(
          
          to,
          from,
          functions,
          args,
          recommendedCallUsed,
          callParamaters,
          data,
          decodedCallText,
          value
        )
          if (args) {
            return (
              <div>
                <strong>From:{from}</strong>
                <strong>To: {to}</strong>
                <strong>Function Name: {functions.name}</strong>
                <strong>Params:</strong>
                {args
                  .filter(item => item != '__length__')
                  .map((item, i) => {
                    return (
                      <>
                        <small>{functions.inputs[i]}</small>
                        <small>{args[item]}</small>
                      </>
                    );
                  })}
              </div>
            );
          }
          console.log(recommendedCallUsed)
          if (recommendedCallUsed) {
            if (advancedCalls) {
              return (
                <div>
                  <strong>From:{from}</strong>
                  <strong>To: {to}</strong>
                  <strong>Descriptions: {recommendedCallUsed.toName}</strong>
                  <strong>Function: {recommendedCallUsed.functionName}</strong>
                  <small>Function: {encodedFunctionName}</small>
                  <strong>
                    Params:{' '}
                    {
                    Object.keys(callParamaters).map(
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
              <strong>From:{from}</strong>
              <strong>To: {to}</strong>
              <strong>data: {data}</strong>
              <strong>Value: {value.toString()}</strong>
            </div>
          );
        }
      )}
    </div>
  );
});

export default CallDataInformation;
