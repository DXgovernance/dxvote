import { useState } from 'react';

import { Button } from 'components/Guilds/common/Button';
import { Modal } from '../common/Modal';
import { StakeTokens } from './StakeTokens';

export const GuestActions = ({ onJoin }) => {
  const [showJoin, setShowJoin] = useState(false);
  return (
    <>
      <Button onClick={() => setShowJoin(true)}>Join</Button>
      <Modal
        header="Stake DXdao tokens"
        isOpen={showJoin}
        onDismiss={() => setShowJoin(false)}
        maxWidth={300}
      >
        <StakeTokens onJoin={onJoin} />
      </Modal>
    </>
  );
};
