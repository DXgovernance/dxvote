import styled from 'styled-components';
import { Box } from '../common/Layout';
import { Button } from '../common/Button';
import { Menu, MenuItem } from '../common/Menu';
import dxIcon from '../../../assets/images/dxdao-icon.svg';
import { useState } from 'react';

const SidebarWrapper = styled(Box)`
  border: 1px solid #000;
  border-radius: 0.5rem;
  margin-right: 1rem;
`;

const SidebarHeader = styled(Box)`
  border-bottom: 1px solid #000;
`;

const DaoInfoPanel = styled(Box)<{ shrink: boolean }>`
  display: flex;
  flex-direction: ${props => (props.shrink ? 'row' : 'column')};
  align-items: center;
  padding: ${props => (props.shrink ? '1rem' : '2rem')};
  cursor: pointer;
`;

const DaoDetails = styled(Box)<{ shrink: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => (props.shrink ? 'center' : 'flex-start')};
  padding-left: ${props => (props.shrink ? '0' : '1rem')};
`;

const UserInfoPanel = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.2rem;
  border-top: 1px solid #000;
`;

const UserInfoDetail = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  width: 100%;

  > :last-child {
    font-weight: 600;
  }
`;

const UserInfoButton = styled(Button)`
  margin-top: 0.7rem;
  width: 100%;
`;

const DaoIcon = styled.img`
  height: 3rem;
  width: 3rem;
`;

const DaoTitle = styled(Box)`
  font-weight: 600;
  font-size: 1.25rem;
  margin: 0.5rem 0;
`;

const DaoMemberCount = styled(Box)`
  font-size: 1rem;
  margin-bottom: 0.6rem;
`;

const SidebarMenu = styled(Menu)`
  margin: 0;
  padding: 1rem 0;
`;

const SidebarMenuItem = styled(MenuItem)`
  font-size: 1rem;
  padding: 0.8rem 1rem;

  &:hover {
    border-left: 2px solid #000;
  }

  &:active {
    border-left: 2px solid #000;
  }
`;

const Sidebar = () => {
  const [showExtendedHeader, setShowExtendedHeader] = useState<boolean>(false);

  return (
    <SidebarWrapper>
      <SidebarHeader>
        <DaoInfoPanel
          onClick={() => setShowExtendedHeader(!showExtendedHeader)}
          shrink={showExtendedHeader}
        >
          <DaoIcon src={dxIcon} alt={'DXdao Logo'} />
          <DaoDetails shrink={!showExtendedHeader}>
            <DaoTitle as="h1">DXdao</DaoTitle>
            <DaoMemberCount>464 Members</DaoMemberCount>
          </DaoDetails>
          {!showExtendedHeader && <Button>Create Proposal</Button>}
        </DaoInfoPanel>

        {showExtendedHeader && (
          <UserInfoPanel shrink={showExtendedHeader}>
            <UserInfoDetail>
              <span>Member</span>
              <span>geronimo.eth</span>
            </UserInfoDetail>
            <UserInfoDetail>
              <span>Voting Power</span>
              <span>3.54%</span>
            </UserInfoDetail>
            <UserInfoDetail>
              <span>Locked</span>
              <span>354.54</span>
            </UserInfoDetail>
            <UserInfoDetail>
              <span>Duration</span>
              <span>541 days</span>
            </UserInfoDetail>

            <UserInfoButton>Increase Voting Power</UserInfoButton>
          </UserInfoPanel>
        )}
      </SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem href="#">Proposals</SidebarMenuItem>
        <SidebarMenuItem href="#">Members</SidebarMenuItem>
        <SidebarMenuItem href="#">Portfolio</SidebarMenuItem>
        <SidebarMenuItem href="#">Settings</SidebarMenuItem>
      </SidebarMenu>
    </SidebarWrapper>
  );
};

export default Sidebar;
