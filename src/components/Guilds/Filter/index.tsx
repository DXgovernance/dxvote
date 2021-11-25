import { useState } from 'react';
import styled from 'styled-components';
import { isDesktop, isMobile } from 'react-device-detect';

import {
  DropdownButton,
  DropdownContent,
  DropdownMenu,
  DropdownPosition,
} from '../common/DropdownMenu';
import { FiChevronDown } from 'react-icons/fi';
import { Menu, MenuItem } from '../common/Menu';
import { Button } from '../common/Button';
import { InputText } from '../common/Form';
import { Box } from '../common/Layout/Box';

const DropdownMenuItem = styled(MenuItem)`
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

const FilterButtonsComponent = () => (
  <FilterButtons>
    <DropdownMenu position={DropdownPosition.BottomRight}>
      <DropdownButton iconRight>
        Scheme <FiChevronDown />
      </DropdownButton>
      <DropdownContent>
        <Menu>
          <DropdownMenuItem>Schema 1</DropdownMenuItem>
          <DropdownMenuItem>Schema 2</DropdownMenuItem>
          <DropdownMenuItem>Schema 3</DropdownMenuItem>
        </Menu>
      </DropdownContent>
    </DropdownMenu>
    <DropdownMenu>
      <DropdownButton iconRight>
        Status <FiChevronDown />
      </DropdownButton>
      <DropdownContent>
        <Menu>
          <DropdownMenuItem>Status a</DropdownMenuItem>
          <DropdownMenuItem>Status b</DropdownMenuItem>
          <DropdownMenuItem>Status c</DropdownMenuItem>
          <DropdownMenuItem>Status d</DropdownMenuItem>
        </Menu>
      </DropdownContent>
    </DropdownMenu>
  </FilterButtons>
);

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
