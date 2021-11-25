import styled from 'styled-components';
import { IconButton } from '../common/Button';
import dxIcon from '../../../assets/images/dxdao-icon.svg';
import { FiChevronDown } from 'react-icons/fi';
const Icon = styled.img`
  height: 1.1rem;
  width: 1.1rem;
`;

const UserActionButton = styled(IconButton)`
  border-radius: 10px;
`;

export const UserActions = () => (
  <UserActionButton iconLeft>
    <Icon src={dxIcon} alt={'Icon'} />
    <span>geronimo.eth</span>
    <FiChevronDown />
  </UserActionButton>
);
