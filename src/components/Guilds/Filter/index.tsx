import { useState } from 'react';
import styled from 'styled-components';
import { isDesktop, isMobile } from 'react-device-detect';

import {
  DropdownButton,
  DropdownContent,
  DropdownMenu,
  DropdownPosition,
} from '../common/DropdownMenu';

import { FiChevronDown, FiCheck } from 'react-icons/fi';

import { Menu, MenuItem } from '../common/Menu';
import { Button } from '../common/Button';
import { InputText } from '../common/Form';
import { Box } from '../common/Layout/Box';

import { useMenu } from '../../../hooks/Guilds/useMenu';

const DropdownMenuItem = styled(MenuItem)`
  display: flex;
  flex: 1;
  justify-content: space-between;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const FilterContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const FilterButtons = styled.div`
  display: flex;
  flex-direction: row;
`;

const FilterRow = styled.div`
  display: flex;
  flex-direction: row;
  @media only screen and (min-width: 768px) {
    justify-content: space-between;
  }
`;

const FilterButtonsComponent = () => {
  const { isStatusSelected, isSchemeSelected, onToggleStatus, onToggleScheme } =
    useMenu({ initialSchemas: [], initialStatuses: [] });

  return (
    <FilterButtons>
      <DropdownMenu position={DropdownPosition.BottomRight}>
        <DropdownButton iconRight>
          Scheme <FiChevronDown />
        </DropdownButton>
        <DropdownContent>
          <Menu>
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
      <DropdownMenu>
        <DropdownButton iconRight>
          Status <FiChevronDown />
        </DropdownButton>
        <DropdownContent>
          <Menu>
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

export const Filter = () => {
  const [viewFilter, setViewFilter] = useState(false);

  return (
    <FilterContainer>
      <FilterRow>
        <InputText placeholder="Proposal title" />
        {isDesktop && <FilterButtonsComponent />}
        {isMobile && (
          <Button
            onClick={() => setViewFilter(!viewFilter)}
            active={viewFilter}
          >
            Filter
          </Button>
        )}
      </FilterRow>
      {isMobile && viewFilter && <FilterButtonsComponent />}
    </FilterContainer>
  );
};
