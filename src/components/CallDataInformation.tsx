import { useContext } from 'contexts';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useABIService } from 'hooks/useABIService';
import { observer } from 'mobx-react';

const CallDataInformation = observer((advancedCalls: boolean) => {
  const {
    context: { daoStore, configStore },
  } = useContext();

  const proposalId = useLocation().pathname.split('/')[3];
  const networkContracts = configStore.getNetworkContracts();
  const proposal = daoStore.getProposal(proposalId);
  const scheme = daoStore.getScheme(proposal.scheme);
  const { decodedCallData } = useABIService(proposalId);
  const [proposalCallTexts, setProposalCallTexts] = useState(
    new Array(proposal.to.length)
  );

  useEffect(() => {
  const proposalCallArray = [];
  for (var p = 0; p < proposal.to.length; p++) {
    proposalCallArray[p] = decodedCallData(
      scheme.type === 'WalletScheme' &&
        scheme.controllerAddress !== networkContracts.controller
        ? scheme.address
        : networkContracts.avatar,
      proposal.to[p],
      proposal.callData[p],
      proposal.values[p],
      advancedCalls
    );
  }
  setProposalCallTexts(proposalCallTexts);
  console.log(proposalCallTexts)
  }, [proposal])

  return (
    <div>
      {proposalCallTexts.map(proposalCall => {
        return (
          <div>
            <strong>From:{proposalCall.from}</strong>
            <strong>To: {proposalCall.to}</strong>
            <strong>Function Name: {proposalCall.function.name}</strong>
            <strong>Params:</strong>
            {proposalCall.args
              .filter(item => item != '__length__')
              .map((item, i) => {
                return (
                  <>
                    <small>{proposalCall.function.inputs[i]}</small>
                    <small>{proposalCall.args[item]}</small>
                  </>
                );
              })}
          </div>
        );
      })}
    </div>
  );
});

export default CallDataInformation;
