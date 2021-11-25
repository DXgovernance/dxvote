import styled from 'styled-components';
import { Box } from '../common/Layout';
import { Menu, MenuItem } from '../common/Menu';
import { UserActions } from './UserActions';
import dxIcon from '../../../assets/images/dxdao-icon.svg';

const SidebarWrapper = styled(Box)`
  @media only screen and (min-width: 768px) {
    margin-right: 1rem;
    border: 1px solid #000;
    border-radius: 0.5rem;
  }
`;

const DaoInfoPanel = styled(Box)`
  border-bottom: 1px solid #000;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  cursor: pointer;
`;

const DaoInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  @media only screen and (min-width: 768px) {
    flex-direction: column;
  }
`;
const DaoBrand = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  @media only screen and (min-width: 768px) {
    flex-direction: column;
  }
`;
const DaoIcon = styled.img`
  height: 3rem;
  width: 3rem;
`;

const DaoTitle = styled(Box)`
  font-weight: 600;
  font-size: 1.25rem;
  margin-left 4px;
`;

const DaoMemberCount = styled(Box)`
  font-size: 1rem;
`;

const SidebarMenu = styled(Menu)`
  margin: 0;
  padding: 1rem 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  @media only screen and (min-width: 768px) {
    flex-direction: column;
  }
`;

const SidebarMenuItem = styled(MenuItem)`
  font-size: 1rem;
  padding: 0.8rem 1rem;

  &:hover {
    border-bottom: 2px solid #000;

    @media only screen and (min-width: 768px) {
      border-left: 2px solid #000;
    }
  }

  &:active {
    border-bottom: 2px solid #000;

    @media only screen and (min-width: 768px) {
      border-left: 2px solid #000;
    }
  }
`;

export const Sidebar = () => {
  return (
    <SidebarWrapper>
      <DaoInfoPanel>
        <DaoInfo>
          <DaoBrand>
            <DaoIcon src={dxIcon} alt={'DXdao Logo'} />
            <DaoTitle as="h1">DXdao</DaoTitle>
          </DaoBrand>
          <DaoMemberCount>464 Members</DaoMemberCount>
        </DaoInfo>
        <UserActions />
      </DaoInfoPanel>
      <SidebarMenu>
        <SidebarMenuItem href="#">Proposals</SidebarMenuItem>
        <SidebarMenuItem href="#">Members</SidebarMenuItem>
        {/*<SidebarMenuItem href="#">Portfolio</SidebarMenuItem>*/}
        <SidebarMenuItem href="#">Settings</SidebarMenuItem>
      </SidebarMenu>
    </SidebarWrapper>
  );
};
