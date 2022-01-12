import { useRef, useState } from 'react';
import styled from 'styled-components';
import { isMobile } from 'react-device-detect';
import { FiChevronDown } from 'react-icons/fi';
import { FiArrowLeft } from 'react-icons/fi';

import {
  DropdownMenu,
  DropdownContent,
  DropdownHeader,
} from '../common/DropdownMenu';
import { IconButton, Button } from '../common/Button';
import dxIcon from '../../../assets/images/dxdao-icon.svg';

import { useDetectBlur } from 'hooks/Guilds/useDetectBlur';
import TransactionModal from '../Web3Modals/TransactionModal';

const Icon = styled.img`
  height: 1.1rem;
  width: 1.1rem;
`;

const UserActionButton = styled(IconButton)`
  border-radius: 10px;
  flex: 1;
  width: 100%;
`;

const MemberContainer = styled.div`
  padding: 20px;
`;

const ContentItem = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  font-size: 14px;
  padding-bottom: 8px;
`;

const LockButton = styled(Button)`
  margin-top: 12px;
  width: 100%;
`;

export const MemberActions = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false)

  const memberMenuRef = useRef(null);
  useDetectBlur(memberMenuRef, () => setShowMenu(false));
  return (
    <DropdownMenu ref={memberMenuRef}>
      <TransactionModal isOpen={isOpen} />
      <UserActionButton iconLeft onClick={() => setShowMenu(!showMenu)}>
        <Icon src={dxIcon} alt={'Icon'} />
        <span>geronimo.eth</span>
        <FiChevronDown />
      </UserActionButton>
      <DropdownContent fullScreenMobile={true} show={showMenu}>
        {isMobile && (
          <DropdownHeader noTopPadding onClick={() => setShowMenu(false)}>
            <FiArrowLeft /> <span>Membership</span>
          </DropdownHeader>
        )}
        <MemberContainer>
          <ContentItem>
            Voting Power <span>3.54%</span>
          </ContentItem>
          <ContentItem>
            Locked <span>3.54%</span>
          </ContentItem>
          <ContentItem>
            Unlocked in <span>542 days</span>
          </ContentItem>
          <LockButton onClick={() => setIsOpen(true)}> Lock DXD</LockButton>
        </MemberContainer>
      </DropdownContent>
    </DropdownMenu>
  );
};
