import { useContext } from 'contexts';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useABIService } from 'hooks/useABIService';
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
  const [proposalCallTexts, setProposalCallTexts] = useState<ProposalCalls[]>(
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
        advancedCalls,
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
      {proposalCallTexts.map(proposalCall => {
        console.log(proposalCall);
        if (proposalCall.args) {
          return (
            <div>
              <strong>From:{proposalCall.from}</strong>
              <strong>To: {proposalCall.to}</strong>
              <strong>Function Name: {proposalCall.functions.name}</strong>
              <strong>Params:</strong>
              {proposalCall.args
                .filter(item => item != '__length__')
                .map((item, i) => {
                  return (
                    <>
                      <small>{proposalCall.functions.inputs[i]}</small>
                      <small>{proposalCall.args[item]}</small>
                    </>
                  );
                })}
            </div>
          );
        }
        if (proposalCall.recommendedCallsUsed) {
          <div>
            <strong>From:{proposalCall.from}</strong>
            <strong>To: {proposalCall.to}</strong>
            <strong>Descriptions: {proposalCall.recommendedCallsUsed.toName}</strong>
            <strong>Function: {proposalCall.recommendedCallsUsed.functionName}</strong>
            <strong>Params: {Object.keys(proposalCall.callParamaters).map(paramIndex => proposalCall.callParamaters[paramIndex])}</strong>
            <strong>data: {proposalCall.data}</strong>
          </div>;
        }
        return (
          <div>
            <strong>From:{proposalCall.from}</strong>
            <strong>To: {proposalCall.to}</strong>
            <strong>decoded Text: {proposalCall.decodedCallText}</strong>
            <strong>data: {proposalCall.data}</strong>
          </div>
        );
      })}
    </div>
  );
});

export default CallDataInformation;
