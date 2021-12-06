import styled from 'styled-components';
import { useState, useRef } from 'react';
import { isMobile } from 'react-device-detect';

import { useFilter } from 'contexts/Guilds/filters';
import { useDetectBlur } from 'hooks/Guilds/useDetectBlur';

import {
  DropdownContent,
  DropdownMenu,
  DropdownPosition,
} from '../common/DropdownMenu';
import { DropdownButton } from '../common/DropdownMenu';

import { FiChevronDown, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { Menu, MenuItem } from '../common/Menu';
import { Badge } from '../common/Badge';

const DropdownMenuItem = styled(MenuItem)`
  display: flex;
  flex: 1;
  justify-content: space-between;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverMenu};
  }
`;
const FilterButtons = styled.div`
  display: flex;
  flex-direction: row;
`;

export const FilterButton = styled(DropdownButton)`
  background-color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.background};
  color: ${({ active, theme }) =>
    active ? theme.colors.background : 'inherit'};
`;

export const FilterBadge = styled(Badge)`
  margin-left: 5px;
`;

export const FilterMenu = () => {
  const [showScheme, setShowScheme] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const {
    countSchemeSelected,
    isSchemeSelected,
    onToggleScheme,
    countStatusSelected,
    isStatusSelected,
    onToggleStatus,
  } = useFilter();
  const schemeRef = useRef(null);
  const statusRef = useRef(null);

  // hook that handles the click outside the ref element, when clicked calls callback to close.
  useDetectBlur(schemeRef, () => setShowScheme(false));
  useDetectBlur(statusRef, () => setShowStatus(false));

  return (
    <FilterButtons>
      <DropdownMenu ref={schemeRef} position={DropdownPosition.BottomRight}>
        <FilterButton
          iconRight
          onClick={() => {
            setShowScheme(!showScheme);
          }}
          active={countSchemeSelected > 0}
        >
          Scheme <FiChevronDown />
          {countSchemeSelected > 0 && (
            <FilterBadge>{countSchemeSelected}</FilterBadge>
          )}
        </FilterButton>
        <DropdownContent fullScreenMobile={true} show={showScheme}>
          <Menu>
            {isMobile && <FiArrowLeft onClick={() => setShowScheme(false)} />}
            <DropdownMenuItem onClick={() => onToggleScheme('a')}>
              Schema 1 {isSchemeSelected('a') && <FiCheck />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleScheme('b')}>
              Schema 2 {isSchemeSelected('b') && <FiCheck />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleScheme('c')}>
              Schema 3 {isSchemeSelected('c') && <FiCheck />}
            </DropdownMenuItem>
          </Menu>
        </DropdownContent>
      </DropdownMenu>
      <DropdownMenu ref={statusRef} position={DropdownPosition.BottomRight}>
        <FilterButton
          iconRight
          onClick={() => setShowStatus(!showStatus)}
          active={countStatusSelected > 0}
        >
          Status <FiChevronDown />
          {countStatusSelected > 0 && (
            <FilterBadge>{countStatusSelected}</FilterBadge>
          )}
        </FilterButton>
        <DropdownContent fullScreenMobile={true} show={showStatus}>
          <Menu>
            {isMobile && <FiArrowLeft onClick={() => setShowStatus(false)} />}
            <DropdownMenuItem onClick={() => onToggleStatus('a')}>
              Status a {isStatusSelected('a') && <FiCheck />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus('b')}>
              Status b {isStatusSelected('b') && <FiCheck />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus('c')}>
              Status c {isStatusSelected('c') && <FiCheck />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus('d')}>
              Status d {isStatusSelected('d') && <FiCheck />}
            </DropdownMenuItem>
          </Menu>
        </DropdownContent>
      </DropdownMenu>
    </FilterButtons>
  );
};
