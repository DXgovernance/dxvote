import { useRef, useState } from 'react';
import styled from 'styled-components';

import { FiChevronDown } from 'react-icons/fi';

import { DropdownMenu, DropdownContent } from '../common/DropdownMenu';
import { IconButton, Button } from '../common/Button';
import dxIcon from '../../../assets/images/dxdao-icon.svg';

import { useClickOutside } from 'hooks/Guilds/useClickOutside';

const Icon = styled.img`
  height: 1.1rem;
  width: 1.1rem;
`;

const UserActionButton = styled(IconButton)`
  border-radius: 10px;
  flex: 1;
  width: 100%;
`;

const ContentItem = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  justify-content: space-between;
  font-size: 14px;
  padding-bottom: 8px;
`;

const DaoInfoContent = styled(DropdownContent)`
  padding: 20px;
  width: 90%;
  display: ${({ show }) => (show ? 'flex' : 'none')};
  flex-direction: column;
  align-items: center;
`;

const LockButton = styled(Button)`
  width: 100%;
  margin-top: 12px;
`;
export const MemberActions = () => {
  const [showMenu, setShowMenu] = useState(false);
  const memberMenuRef = useRef(null);
  useClickOutside(memberMenuRef, () => setShowMenu(false));
  return (
    <DropdownMenu ref={memberMenuRef}>
      <UserActionButton iconLeft onClick={() => setShowMenu(!showMenu)}>
        <Icon src={dxIcon} alt={'Icon'} />
        <span>geronimo.eth</span>
        <FiChevronDown />
      </UserActionButton>
      <DaoInfoContent fullScreenMobile={false} show={showMenu}>
        <ContentItem>
          Voting Power <span>3.54%</span>
        </ContentItem>
        <ContentItem>
          Locked <span>3.54%</span>
        </ContentItem>
        <ContentItem>
          Unlocked in <span>542 days</span>
        </ContentItem>
        <LockButton onClick={() => alert('lock dxd')}> Lock DXD</LockButton>
      </DaoInfoContent>
    </DropdownMenu>
  );
};
