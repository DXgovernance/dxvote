import useProposalState from 'hooks/Guilds/useProposalState';
import { Button } from 'old-components/common/Button';
import React from 'react';

const ExecuteButton: React.FC = () => {
  const {
    data: { isExecutable, executeProposal },
  } = useProposalState();

  if (!isExecutable) return null;
  return (
    <Button data-testid="execute-btn" onClick={() => executeProposal()}>
      Execute
    </Button>
  );
};

export default ExecuteButton;
