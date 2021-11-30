import { useState } from 'react';
import styled from 'styled-components';
import { isDesktop, isMobile } from 'react-device-detect';
import { useFilter } from 'contexts/Guilds/filters';

import { InputText } from '../common/Form';
import { Box } from '../common/Layout/Box';

import { FilterMenu, FilterButton, FilterBadge } from './FilterMenu';

const FilterContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const FilterRow = styled.div`
  display: flex;
  flex-direction: row;
  @media only screen and (min-width: 768px) {
    justify-content: space-between;
  }
`;

export const Filter = () => {
  const [viewFilter, setViewFilter] = useState(false);
  const { totalFilters } = useFilter();
  return (
    <FilterContainer>
      <FilterRow>
        <InputText placeholder="Proposal title" />
        {isDesktop && <FilterMenu />}
        {isMobile && (
          <FilterButton
            onClick={() => setViewFilter(!viewFilter)}
            active={viewFilter || totalFilters > 0}
          >
            Filter
            {totalFilters > 0 && <FilterBadge>{totalFilters}</FilterBadge>}
          </FilterButton>
        )}
      </FilterRow>
      {isMobile && viewFilter && <FilterMenu />}
    </FilterContainer>
  );
};
