import useProposalState from 'hooks/Guilds/ether-swr/guild/useProposalState';
import React from 'react';
import { Button } from '../common/Button';

const ExecuteButton: React.FC = () => {
  const {
    data: { isExecutable, executeProposal },
  } = useProposalState();

  if (isExecutable) {
    return <Button onClick={() => executeProposal()}>Execute</Button>;
  }

  return null;
};

export default ExecuteButton;
