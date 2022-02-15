import { useState } from 'react';
import styled from 'styled-components';
import { isDesktop, isMobile } from 'react-device-detect';
import { useFilter } from 'contexts/Guilds/filters';

import { InputText } from '../common/Form';
import { Box, Flex } from '../common/Layout/Box';

import { FilterMenu, FilterButton, FilterBadge } from './FilterMenu';
import { Button } from '../common/Button';
import { useHistory, useLocation } from 'react-router';

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

const ButtonContainer = styled(Flex)`
  flex-direction: Row;
`;

export const Filter = () => {
  const [viewFilter, setViewFilter] = useState(false);
  const [createProposal, setCreateProposal] = useState(true);
  const { totalFilters } = useFilter();

  const history = useHistory();
  const location = useLocation();

  return (
    <FilterContainer>
      <FilterRow>
        <InputText placeholder="Proposal title" />
        {createProposal && (
          <ButtonContainer>
            <Button onClick={() => setCreateProposal(false)}>
              Proposal state
            </Button>
            <Button
              variant="secondary"
              onClick={() => history.push(location.pathname + '/proposalType')}
              data-testid="create-proposal-button"
            >
              Create Proposal
            </Button>
          </ButtonContainer>
        )}
        {isDesktop && !createProposal && <FilterMenu />}
        {isMobile && !createProposal && (
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
