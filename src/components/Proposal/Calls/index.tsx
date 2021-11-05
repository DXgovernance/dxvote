import { useState, useEffect } from 'react';
import { useABIService } from 'hooks/useABIService';
import { observer } from 'mobx-react';
import { useEtherscanService } from 'hooks/useEtherscanService';
import { ProposalCalls } from 'types';
import { useContext } from 'contexts';
import { useLocation } from 'react-router-dom';

import PendingCircle from '../../common/PendingCircle';
import { EtherscanCalls } from './EtherscanCalls';
import { RecommendedCalls } from './RecommendedCalls';
import { BaseCalls } from './BaseCalls';
import { ShowMore } from './ShowMore';
import { Divider } from '../styles';

const CallDataInformation = observer(() => {
  const [showMore, setShowMore] = useState(false);
  const {
    context: { configStore, daoStore },
  } = useContext();

  const proposalId = useLocation().pathname.split('/')[3];
  const proposal = daoStore.getProposal(proposalId);
  const networkContracts = configStore.getNetworkContracts();
  const scheme = daoStore.getScheme(proposal.scheme);

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

  if (loading) {
    return <PendingCircle height="44px" width="44px" color="blue" />;
  }

  return (
    <div>
      <ShowMore showMore={showMore} setShowMore={setShowMore} />

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
              {recommendedCallUsed ? (
                <RecommendedCalls
                  to={to}
                  from={from}
                  recommendedCallUsed={recommendedCallUsed}
                  callParameters={callParameters}
                  data={data}
                  encodedFunctionName={encodedFunctionName}
                  // value={value}
                  // contractABI={contractABI}
                  showMore={showMore}
                />
              ) : contractABI.function ? (
                <EtherscanCalls
                  to={to}
                  from={from}
                  abi={contractABI}
                  showMore={showMore}
                />
              ) : (
                <BaseCalls
                  to={to}
                  from={from}
                  data={data}
                  value={value}
                  error={error}
                  showMore={showMore}
                />
              )}
            </div>
          );
        }
      )}
    </div>
  );
});

export default CallDataInformation;
