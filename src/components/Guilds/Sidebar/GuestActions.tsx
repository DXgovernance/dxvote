import styled from 'styled-components';
import { useState } from 'react';
import { isDesktop, isMobile } from 'react-device-detect';
import { FiArrowLeft } from 'react-icons/fi';

import { Button } from 'components/Guilds/common/Button';
import { Modal } from 'components/Modal';
import { StakeTokens } from './StakeTokens';
import {
  DropdownMenu,
  DropdownContent,
  DropdownHeader,
} from '../common/DropdownMenu';

const ModalHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.text};
`;

const JoinButton = styled(Button)`
  width: 100%;
`;

export const GuestActions = ({ onJoin }) => {
  const [showJoin, setShowJoin] = useState(false);
  return (
    <>
      {isDesktop && (
        <>
          <Button onClick={() => setShowJoin(true)}>Join</Button>
          <Modal
            header={<ModalHeader>Stake DXdao tokens</ModalHeader>}
            isOpen={showJoin}
            onDismiss={() => setShowJoin(false)}
            maxWidth={300}
          >
            <StakeTokens onJoin={onJoin} />
          </Modal>
        </>
      )}
      {isMobile && (
        <DropdownMenu>
          <JoinButton onClick={() => setShowJoin(true)}>Join</JoinButton>
          <DropdownContent fullScreenMobile={true} show={showJoin}>
            <DropdownHeader onClick={() => setShowJoin(false)}>
              <FiArrowLeft /> <span>Stake DXdao tokens</span>
            </DropdownHeader>
            <StakeTokens onJoin={onJoin} />
          </DropdownContent>
        </DropdownMenu>
      )}
    </>
  );
};
