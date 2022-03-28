import styled from 'styled-components';
import { FiChevronDown } from 'react-icons/fi';
import { Menu, MenuItem } from 'components/Guilds/common/Menu';
import { useDetectBlur } from 'hooks/Guilds/useDetectBlur';
import Ether from '../../../../assets/images/ether.svg';
import {
  DropdownButton,
  DropdownContent,
  DropdownMenu,
  DropdownPosition,
} from 'components/Guilds/common/DropdownMenu';
import { useRef, useState } from 'react';
import { Flex } from 'components/Guilds/common/Layout';
import StyledIcon from 'components/Guilds/common/SVG';

const AssetCell = styled(Flex)`
  flex-direction: row;
`;

const FilterButton = styled(DropdownButton)`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  margin-right: 1rem;
  width: 90%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

//TODO: identify what assets are available to transfer from smart contracts
//TODO: replace hardcoded assets with dynamic data
interface AssetDropDownProps {}

const DropdownMenuItem = styled(MenuItem)`
  display: flex;
  flex: 1;
  justify-content: space-between;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverMenu};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const AssetDropDown: React.FC<AssetDropDownProps> = () => {
  //
  const [showState, setShowState] = useState(false);

  const stateRef = useRef(null);
  useDetectBlur(stateRef, () => setShowState(false));

  return (
    <DropdownMenu position={DropdownPosition.BottomRight}>
      <FilterButton
        iconRight
        onClick={() => {
          setShowState(!showState);
        }}
      >
        <AssetCell>
          <StyledIcon src={Ether} /> Ether
        </AssetCell>
        <FiChevronDown />
      </FilterButton>
      <DropdownContent show={showState}>
        <Menu>
          <DropdownMenuItem>Dai</DropdownMenuItem>
          <DropdownMenuItem>USDC</DropdownMenuItem>
        </Menu>
      </DropdownContent>
    </DropdownMenu>
  );
};
