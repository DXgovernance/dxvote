import styled from 'styled-components';
import { Box } from '../common/Layout';
import { Button } from '../common/Button';
import { Menu, MenuItem } from '../common/Menu';
import dxIcon from '../../../assets/images/dxdao-icon.svg';
import { useState } from 'react';

const SidebarHeader = styled(Box)`
  border-bottom: 1px solid #000;
  padding: 1rem 0rem;
`;

const DaoInfoPanel = styled(Box)`
  padding: '1rem';
  cursor: pointer;
  display: flex;
  flex-direction: column;
`;
const DaoInfoRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const DaoBrand = styled.div`
  display: flex;
  flex-direction: row;
`;

/*
const DaoDetails = styled(Box)<{ shrink: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => (props.shrink ? 'center' : 'flex-start')};
  padding-left: ${props => (props.shrink ? '0' : '1rem')};
`;
*/
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
  margin-left: 0.5rem;
`;

const DaoMemberCount = styled(Box)`
  font-size: 1rem;
`;

const SidebarMenu = styled(Menu)`
  margin: 0;
  padding: 1rem 0;
  flex-direction: row;
  justify-content: space-between;
`;

const SidebarMenuItem = styled(MenuItem)`
  font-size: 1rem;
  padding: 0.8rem 1rem;

  &:hover {
    border-bottom: 2px solid #000;
  }

  &:active {
    border-bottom: 2px solid #000;
  }
`;

export const SidebarMobile = () => {
  const [showExtendedHeader, setShowExtendedHeader] = useState<boolean>(false);

  return (
    <>
      <SidebarHeader>
        <DaoInfoPanel
          onClick={() => setShowExtendedHeader(!showExtendedHeader)}
          shrink={showExtendedHeader}
        >
          <DaoInfoRow>
            <DaoBrand>
              <DaoIcon src={dxIcon} alt={'DXdao Logo'} />
              <DaoTitle as="h1">DXdao</DaoTitle>
            </DaoBrand>

            <DaoMemberCount>464 Members</DaoMemberCount>
          </DaoInfoRow>
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
        {/* what happens in mobile? 
        <SidebarMenuItem href="#">Portfolio</SidebarMenuItem>*/}
        <SidebarMenuItem href="#">Settings</SidebarMenuItem>
      </SidebarMenu>
    </>
  );
};
