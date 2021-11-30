import { useState } from 'react';
import styled from 'styled-components';
import { IconButton, Button } from '../common/Button';
import dxIcon from '../../../assets/images/dxdao-icon.svg';
import { FiChevronDown } from 'react-icons/fi';
import { DropdownMenu, DropdownContent } from '../common/DropdownMenu';

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
  padding-bottom: 5px;
`;

const DaoInfoContent = styled(DropdownContent)`
  padding: 10px;
  width: 90%;
  display: ${({ show }) => (show ? 'flex' : 'none')};
  flex-direction: column;
  align-items: center;
`;

const CenteredDropdownMenu = styled(DropdownMenu)``;

export const MemberActions = () => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <CenteredDropdownMenu>
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
        <Button onClick={() => alert('lock dxd')}> Lock DXD</Button>
      </DaoInfoContent>
    </CenteredDropdownMenu>
  );
};
