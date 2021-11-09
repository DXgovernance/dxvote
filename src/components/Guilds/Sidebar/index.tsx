import styled from 'styled-components';
import { Box } from '../common/Layout';
import { Button } from '../common/Button';
import dxIcon from '../../../assets/images/dxdao-icon.svg';

const SidebarWrapper = styled(Box)`
  border: 1px solid #000;
  border-radius: 0.5rem;
  margin-right: 1rem;
`;

const SidebarHeader = styled(Box)`
  border-bottom: 1px solid #000;
  padding: 2rem;

  display: flex;
  flex-direction: column;
  align-items: center;
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
  margin-bottom: 1rem;
`;

const SidebarMenu = styled(Box)`
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
`;

const MenuItem = styled.a`
  display: block;
  text-decoration: none;
  color: initial;
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
  return (
    <SidebarWrapper>
      <SidebarHeader>
        <DaoIcon src={dxIcon} alt={'DXdao Logo'} />
        <DaoTitle as="h1">DXdao</DaoTitle>
        <DaoMemberCount>464 Members</DaoMemberCount>
        <Button>Create Proposal</Button>
      </SidebarHeader>
      <SidebarMenu>
        <MenuItem href="#">Proposals</MenuItem>
        <MenuItem href="#">Members</MenuItem>
        <MenuItem href="#">Portfolio</MenuItem>
        <MenuItem href="#">Settings</MenuItem>
      </SidebarMenu>
    </SidebarWrapper>
  );
};

export default Sidebar;
