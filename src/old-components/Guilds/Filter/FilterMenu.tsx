import styled from 'styled-components';
import { useState, useRef } from 'react';
import { isMobile, isDesktop } from 'react-device-detect';

import { useFilter } from 'contexts/Guilds/filters';
import { useDetectBlur } from 'hooks/Guilds/useDetectBlur';

import {
  DropdownContent,
  DropdownHeader,
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
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverMenu};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const FilterButtons = styled.div`
  display: flex;
  flex-direction: row;
  color: ${({ theme }) => theme.colors.text};
  & img,
  svg {
    margin-left: 15px;
  }
`;

const FilterResetMobile = styled.div`
  margin-left: auto;
  margin-right: 20px;
`;

const FilterResetDesktop = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 10px;
  text-align: center;
  cursor: pointer;
  border-top: 0.5px solid ${({ theme }) => theme.colors.text};
`;

export const FilterButton = styled(DropdownButton)`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  margin-right: 1rem;
`;

export const FilterBadge = styled(Badge)`
  margin-left: 5px;
`;

export const FilterMenu = () => {
  const [showState, setShowState] = useState(false);
  const [showType, setShowType] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);

  const {
    onToggleState,
    onResetState,
    isStateSelected,
    countStateSelected,
    onToggleType,
    onResetType,
    isTypeSelected,
    countTypeSelected,
    onToggleCurrency,
    onResetCurrency,
    isCurrencySelected,
    countCurrencySelected,
  } = useFilter();
  const stateRef = useRef(null);
  const typeRef = useRef(null);
  const currencyRef = useRef(null);

  // hook that handles the click outside the ref element, when clicked calls callback to close.
  useDetectBlur(stateRef, () => setShowState(false));
  useDetectBlur(typeRef, () => setShowType(false));
  useDetectBlur(currencyRef, () => setShowCurrency(false));

  return (
    <FilterButtons>
      <DropdownMenu ref={stateRef} position={DropdownPosition.BottomRight}>
        <FilterButton
          iconRight
          onClick={() => {
            setShowState(!showState);
          }}
        >
          State <FiChevronDown />
        </FilterButton>
        <DropdownContent fullScreenMobile={true} show={showState}>
          {isMobile && (
            <DropdownHeader onClick={() => setShowState(false)}>
              <FiArrowLeft /> <span>State</span>{' '}
              <FilterResetMobile onClick={onResetState}>
                Reset
              </FilterResetMobile>
            </DropdownHeader>
          )}
          <Menu>
            <DropdownMenuItem onClick={() => onToggleState('a')}>
              State 1 {isStateSelected('a') && <FiCheck />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleState('b')}>
              State 2 {isStateSelected('b') && <FiCheck />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleState('c')}>
              State 3 {isStateSelected('c') && <FiCheck />}
            </DropdownMenuItem>
          </Menu>
          {isDesktop && countStateSelected > 0 && (
            <FilterResetDesktop onClick={onResetState}>
              Reset
            </FilterResetDesktop>
          )}
        </DropdownContent>
      </DropdownMenu>
      <DropdownMenu ref={typeRef} position={DropdownPosition.BottomRight}>
        <FilterButton iconRight onClick={() => setShowType(!showType)}>
          Type <FiChevronDown />
        </FilterButton>
        <DropdownContent fullScreenMobile={true} show={showType}>
          {isMobile && (
            <DropdownHeader onClick={() => setShowType(false)}>
              <FiArrowLeft /> <span>Type</span>{' '}
              <FilterResetMobile onClick={onResetType}>Reset</FilterResetMobile>
            </DropdownHeader>
          )}
          <Menu>
            <DropdownMenuItem onClick={() => onToggleType('a')}>
              Type a {isTypeSelected('a') && <FiCheck />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleType('b')}>
              Type b {isTypeSelected('b') && <FiCheck />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleType('c')}>
              Type c {isTypeSelected('c') && <FiCheck />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleType('d')}>
              Type d {isTypeSelected('d') && <FiCheck />}
            </DropdownMenuItem>
          </Menu>
          {isDesktop && countTypeSelected > 0 && (
            <FilterResetDesktop onClick={onResetType}>Reset</FilterResetDesktop>
          )}
        </DropdownContent>
      </DropdownMenu>

      <DropdownMenu ref={currencyRef} position={DropdownPosition.BottomRight}>
        <FilterButton iconRight onClick={() => setShowCurrency(!showCurrency)}>
          Currency <FiChevronDown />
        </FilterButton>
        <DropdownContent fullScreenMobile={true} show={showCurrency}>
          {isMobile && (
            <DropdownHeader onClick={() => setShowCurrency(false)}>
              <FiArrowLeft /> <span>Currency</span>{' '}
              <FilterResetMobile onClick={onResetCurrency}>
                Reset
              </FilterResetMobile>
            </DropdownHeader>
          )}
          <Menu>
            <DropdownMenuItem onClick={() => onToggleCurrency('a')}>
              Currency a {isCurrencySelected('a') && <FiCheck />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleCurrency('b')}>
              Currency b {isCurrencySelected('b') && <FiCheck />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleCurrency('c')}>
              Currency c {isCurrencySelected('c') && <FiCheck />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleCurrency('d')}>
              Currency d {isCurrencySelected('d') && <FiCheck />}
            </DropdownMenuItem>
          </Menu>
          {isDesktop && countCurrencySelected > 0 && (
            <FilterResetDesktop onClick={onResetCurrency}>
              Reset
            </FilterResetDesktop>
          )}
        </DropdownContent>
      </DropdownMenu>
    </FilterButtons>
  );
};
