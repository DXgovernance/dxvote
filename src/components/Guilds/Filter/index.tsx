import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { isDesktop, isMobile } from 'react-device-detect';
import { useParams } from 'react-router';
import { useFilter } from 'contexts/Guilds/filters';

import { InputText } from '../common/Form';
import { Box, Flex } from '../common/Layout/Box';

import { FilterMenu, FilterButton, FilterBadge } from './FilterMenu';
import { Button } from '../common/Button';
import { useHistory, useLocation } from 'react-router';
import { useVotingPowerOf } from 'hooks/Guilds/ether-swr/useVotingPowerOf';
import { useWeb3React } from '@web3-react/core';
import { useGuildConfig } from 'hooks/Guilds/ether-swr/useGuildConfig';

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
  const { guild_id: guildId } =
    useParams<{ chain_name?: string; guild_id?: string }>();
  const [viewFilter, setViewFilter] = useState(false);
  const { totalFilters } = useFilter();

  const history = useHistory();
  const location = useLocation();

  const { account } = useWeb3React();
  const { data: votingPower } = useVotingPowerOf({
    contractAddress: guildId,
    userAddress: account,
  });
  const { data: guildConfig } = useGuildConfig(guildId);
  const isProposalCreationAllowed = useMemo(() => {
    if (!guildConfig || !votingPower) {
      return false;
    }
    if (votingPower.gte(guildConfig.votingPowerForProposalCreation)) {
      return true;
    }
    return false;
  }, [votingPower, guildConfig]);

  return (
    <FilterContainer>
      <FilterRow>
        <InputText placeholder="Proposal title" />
        {isProposalCreationAllowed && (
          <ButtonContainer>
            <Button>Proposal state</Button>
            <Button
              variant="secondary"
              onClick={() => history.push(location.pathname + '/proposalType')}
              data-testid="create-proposal-button"
            >
              Create Proposal
            </Button>
          </ButtonContainer>
        )}
        {isDesktop && !isProposalCreationAllowed && <FilterMenu />}
        {isMobile && !isProposalCreationAllowed && (
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
