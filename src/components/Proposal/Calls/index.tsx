import { useState } from 'react';
import { FiZoomIn, FiZoomOut } from 'react-icons/fi';
import { useContext } from 'contexts';
import { useLocation } from 'react-router-dom';

import { Question } from 'components/common';
import CallDataInformation from './CallDataInformation';

const Calls = () => {
  const [showMore, setShowMore] = useState(false);
  const {
    context: { configStore, daoStore },
  } = useContext();
  const proposalId = useLocation().pathname.split('/')[3];
  const proposal = daoStore.getProposal(proposalId);
  const networkContracts = configStore.getNetworkContracts();
  const scheme = daoStore.getScheme(proposal.scheme);

  return (
    <>
      <h2>
        {' '}
        Calls
        {showMore ? (
          <FiZoomOut
            onClick={() => {
              setShowMore(false);
            }}
          />
        ) : (
          <FiZoomIn
            onClick={() => {
              setShowMore(true);
            }}
          />
        )}
        <Question question="9" />
      </h2>

      <CallDataInformation
        advancedCalls={showMore}
        scheme={scheme}
        proposal={proposal}
        networkContracts={networkContracts}
      />
    </>
  );
};

export default Calls;
