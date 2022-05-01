import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { isDesktop, isMobile } from 'react-device-detect';
import { useParams } from 'react-router';
import { useFilter } from 'contexts/Guilds/filters';
import { AiOutlineSearch } from 'react-icons/ai';
import Input from '../common/Form/Input';
import { Flex, Box } from '../common/Layout/Box';
import { FilterMenu, FilterButton, FilterBadge } from './FilterMenu';
import { Button, IconButton } from '../common/Button';
import { useHistory, useLocation } from 'react-router';
import { useVotingPowerOf } from 'hooks/Guilds/ether-swr/guild/useVotingPowerOf';
import { useWeb3React } from '@web3-react/core';
import { useGuildConfig } from 'hooks/Guilds/ether-swr/guild/useGuildConfig';

const FilterContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const FilterRow = styled(Flex)`
  display: flex;
  flex-direction: row;

  @media only screen and (min-width: 768px) {
    justify-content: space-between;
    width: 100%;
  }
`;

const ButtonContainer = styled(Flex)`
  flex-direction: row;
  justify-content: flex-end;
  width: 57%;
`;

const StyledIconButton = styled(IconButton)`
  border-radius: 20px;
  padding: ${props => props.padding || '0.7rem 1.2rem'};
  margin: ${props => props.marginLeft};
`;

const StyledInputWrapper = styled(Box)`
  margin-top: 1rem;
  width: 97%;
`;

export const Filter = () => {
  const { guildId } = useParams();
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
  const [openSearchBar, setOpenSearchBar] = useState(false);
  return (
    <FilterContainer>
      <FilterRow>
        {isMobile && !isProposalCreationAllowed && (
          <FilterButton
            onClick={() => setViewFilter(!viewFilter)}
            active={viewFilter || totalFilters > 0}
          >
            Filter
            {totalFilters > 0 && <FilterBadge>{totalFilters}</FilterBadge>}
          </FilterButton>
        )}
        {isDesktop && <FilterMenu />}

        <ButtonContainer>
          <StyledIconButton
            variant="secondary"
            padding="0.4rem"
            onClick={() => setOpenSearchBar(!openSearchBar)}
          >
            <AiOutlineSearch size={20} />
          </StyledIconButton>
          {isProposalCreationAllowed && (
            <Button
              variant="secondary"
              onClick={() => history.push(location.pathname + '/proposalType')}
              data-testid="create-proposal-button"
            >
              Create Proposal
            </Button>
          )}
        </ButtonContainer>
      </FilterRow>
      {isMobile && viewFilter && <FilterMenu />}
      {openSearchBar ? (
        <StyledInputWrapper>
          <Input
            value={''}
            icon={<AiOutlineSearch size={24} />}
            placeholder="Search title, ENS, address"
          />
        </StyledInputWrapper>
      ) : null}
    </FilterContainer>
  );
};
